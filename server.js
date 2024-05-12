import express from 'express';
import mainDB from './lib/prisma.js'
import { downloadFile, passwordEnc, setToken, startStream } from './lib/utils.js';
import fs from 'fs'
import cors from 'cors';

const SESSIONS = {};
const STREAMERS = new Map();
const ACTIVE_LINKS = {};
const ACTIVE_LINKS_BY_USER = {}
var TASK_STARTED = false;

const DOWNLOAD_LIST = [];

const app = express();

app.use(cors());

app.use(express.json());


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

async function startTask() {
    if (DOWNLOAD_LIST[0] && DOWNLOAD_LIST[0].status == 'pending') {
        console.log("Iniciando tarefa...");
        TASK_STARTED = true;
        DOWNLOAD_LIST[0].status = 'downloading';
        downloadFile(DOWNLOAD_LIST[0].url, `storage/${DOWNLOAD_LIST[0].token}.mp4`).finally(() => {
            console.log("Removendo tarefa...");
            DOWNLOAD_LIST.splice(0, 1);
            if (DOWNLOAD_LIST[0]) {
                console.log("Reiniciando executor de tarefas...");
                startTask();
            } else {
                console.log("Fechando executor de tarefas...");
                TASK_STARTED = false;
            }
        })
    }
}

app.post('/auth', async (req, res) => {
    console.log(req.body);
    let { username, password } = req.body;
    if (username && password) {
        password = passwordEnc(password);
        const user = await mainDB.users.findFirst({
            where: {
                username,
                password
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
    let {token} = req.body;
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
    let { token } = req.body;
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

app.get('/request-media/:titleToken', (req, res) => {
    const titleToken = req.params.titleToken;
    if (ACTIVE_LINKS[titleToken]) {

        let content = { ...ACTIVE_LINKS[titleToken] };

        let internalFile = `storage/${content.token}.mp4`;
        if (!fs.existsSync(internalFile)) {
            console.log("Este título ainda não está pronto para ser reproduzido");
            res.status(501).json({ message: 'Este título ainda não está pronto para ser reproduzido' });
        } else {
            console.log("Iniciando Streaming");
            startStream(internalFile, STREAMERS, content.user, req, res);
        }
    } else {
        res.status(404).json({ message: "not found" });
    }
});

app.get('/ready/:titleToken', (req, res) => {
    const titleToken = req.params.titleToken;
    console.log("Checando link: "+titleToken);
    if (ACTIVE_LINKS[titleToken]) {

        let content = { ...ACTIVE_LINKS[titleToken] };

        let internalFile = `storage/${content.token}.mp4`;
        if (fs.existsSync(internalFile) && (!DOWNLOAD_LIST.length || DOWNLOAD_LIST[0].token !== content.token)) {
            console.log(titleToken,true);
            res.status(200).json({ message: 'O título está pronto!' });
        } else {
            console.log(titleToken,false);
            res.status(505).json({ message: 'O título estará disponível em alguns minutos.' });
        }
    } else {
        console.log("Link inexistente");
        res.status(404).json({ message: "not found" });
    }
});

app.get('/categories', async (req, res) => {
    try {
        let catalog = await mainDB.catalog.groupBy({
            by: 'categoria'
        });
        let result = [];
        catalog.map((i) => { result.push(i.categoria) });
        res.status(200).json(result);
    } catch (error) {
        console.error(error)
        res.status(501).json({ message: 'Erro Interno!' });
    }
})

app.get('/subcategories/:category', async (req, res) => {
    const category = req.params.category;
    try {
        let catalog = await mainDB.catalog.groupBy({
            by: 'subcategoria',
            where: {
                categoria: category
            }
        });
        let result = [];
        catalog.map((i) => { result.push(i.subcategoria) });
        res.status(200).json(result);
    } catch (error) {
        console.error(error)
        res.status(501).json({ message: 'Erro Interno!' });
    }
})

app.get('/list/:category', async (req, res) => {
    const category = req.params.category;
    const MAX_ITEMS_PER_PAGE = 30;
    let { page, query, subcategory } = req.query;
    if (!page) {
        page = 1;
    } else {
        page = parseInt(page);
        if (isNaN(page)) {
            page = 1;
        }
    }
    let wr = {
        categoria: category
    };
    if (query) {
        wr.title = {
            contains: query
        }
    }
    if (subcategory) {
        wr.subcategoria = subcategory;
    }
    try {
        let ct = await mainDB.catalog.count({
            where: wr
        });
        let catalog = await mainDB.catalog.findMany({
            select: {
                token: true,
                description: true,
                title: true,
                lancamento: true,
                image1: true
            },
            where: wr,
            take: MAX_ITEMS_PER_PAGE,
            skip: (page - 1) * MAX_ITEMS_PER_PAGE
        });

        res.status(200).json({ catalog, count: ct, page });
    } catch (error) {
        console.error(error)
        res.status(501).json({ message: 'Erro Interno!' });
    }
})

app.post('/create-link', async (req, res) => {
    let { token, content } = req.body;
    if (token && content) {
        let session = await checkToken(token);
        if (session) {
            let catalog = await mainDB.catalog.findFirst({ where: { token: content } });
            if (catalog) {
                if (ACTIVE_LINKS_BY_USER[session.user_ref]) {
                    delete ACTIVE_LINKS[ACTIVE_LINKS_BY_USER[session.user_ref]];
                }
                let newLink = setToken(16);
                ACTIVE_LINKS[newLink] = { ...catalog, user: session.user_ref };
                ACTIVE_LINKS_BY_USER[session.user_ref] = newLink;
                if(!fs.existsSync(`storage/${catalog.token}.mp4`)){
                    DOWNLOAD_LIST.push({
                        url: catalog.external_link,
                        token: catalog.token,
                        title: catalog.title,
                        status: 'pending'
                    });
                    startTask();
                }
                if(!fs.existsSync(`/www/wwwroot/cdn.iwantmylink.space/${newLink}.mp4`)){
                    fs.symlinkSync(process.env.dir+`/storage/${catalog.token}.mp4`,`/www/wwwroot/cdn.iwantmylink.space/${newLink}.mp4`);
                }
                console.log("Link criado: "+newLink);
                res.status(200).json({ link: newLink });
            } else {
                res.status(404).json({ message: "Título não encontrado" });
            }
        } else {
            res.status(403).json({ message: 'Acesso Negado!' });
        }
    } else {
        res.status(400).json({ message: 'Requisição Inválida!' });
    }
});

app.get('/', async (req, res) => {
    res.status(200).send("Ok");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});