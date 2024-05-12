import express from 'express';
import mainDB from './lib/prisma.js'
import { downloadFile, passwordEnc, setToken, startStream } from './lib/utils.js';
import fs from 'fs'
import cors from 'cors';
import { SESSIONS } from './memory/memories.js';

const app = express();      // Define o server
app.use(cors());            // Define CORS como permitido
app.use(express.json());    // Define o meddleware de comunicação JSON

async function checkToken(token) {
    if (SESSIONS[token]) {
        SESSIONS[token].activity = Date.now();
        return SESSIONS[token];
    }
    let session = await mainDB.sessions.findFirst({ where: { token } });
    if (session) {
        let user = await mainDB.users.findFirst({ where: { token: session.user_ref }, select: { id: true, username: true, token: true } });
        session.user = user;
        session.activity = Date.now();
        SESSIONS[token] = session;
        return session;
    } else {
        return false;
    }
}

app.post('/login', async (req, res) => {
    let { email, senha } = req.body;
    if (email && senha) {
        senha = passwordEnc(senha);
        const user = await mainDB.users.findFirst({
            where: {
                email,
                senha
            }
        });

        if (user) {
            if (user.status == 'active') {
                let session = await mainDB.sessions.create({
                    data: {
                        user_ref: user.token,
                        token: setToken(32),
                    }
                });
                if (session) {
                    SESSIONS[session.token] = { ...session, user: { id: user.id, username: user.username, token: user.token }, activity: Date.now() };
                    res.status(200).json({ message: 'Autenticação bem-sucedida!', token: session.token });
                } else {
                    res.status(501).json({ message: 'Falha ao iniciar a sessão, tente novamente!' });
                }
            } else {
                res.status(403).json({ message: 'Conta Indisponível!' });
            }
        } else {
            res.status(401).json({ message: 'Credenciais inválidas!' });
        }
    } else {
        res.status(400).json({ message: 'Requisição inválida!' });
    }
});

app.post('/check-auth', async (req, res) => {
    let { token } = req.headers.authorization;
    if(token){
        let result = await checkToken(token);
        if(result){
            res.status(200).json({ message: 'valid',session:SESSIONS[token]||null});
        }else{
            res.status(401).json({ message: 'invalid'});
        }
    }else{
        res.status(400).json({ message: 'Requisição inválida!' });
    }
})

app.post('/logout', async (req, res) => {
    let { token } = req.headers.authorization;
    if (token) {
        if (SESSIONS[token]) {
            delete SESSIONS[token];
            await mainDB.sessions.delete({
                where: {
                    token
                }
            })
        }
        res.status(200).json({ message: 'ok' });
    } else {
        res.status(400).json({ message: 'Requisição inválida!' });
    }
});

app.post('/change-password', async (req, res) => {
    let { token, password } = req.body;
    if (token && password) {
        password = passwordEnc(password);
        let session = await checkToken(token);
        if (session) {
            const user = await mainDB.users.update({
                where: {
                    token: session.user_ref
                },
                data: {
                    password
                }
            });
            res.status(200).json({ message: 'Sucesso!' });
        } else {
            res.status(401).json({ message: 'Não Autorizado!' });
        }
    } else {
        res.status(400).json({ message: 'Requisição Inválida, tente novamente!' });
    }
});

app.get('/', async (req, res) => {
    res.status(200).send("running");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});