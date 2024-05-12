import mainDB from "../lib/prisma";
import { setToken, checkToken ,setToken, passwordEnc} from "../lib/utils";
import { SESSIONS } from "../memory/memories";

class Users {
    static async login(req, res) {
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
    }

    static async checkAuth(req, res) {
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
    }
    static async logout(req, res) {
        let { token } = req.headers.authorization;
        if (token) {
            if (SESSIONS[token]) {
                delete SESSIONS[token];
                await mainDB.sessions.delete({
                    where: {
                        token
                    }
                });
            }
            res.status(200).json({ message: 'ok' });
        } else {
            res.status(400).json({ message: 'Requisição inválida!' });
        }
    }
    static async changePassword(req,res) {
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
    }
}

export default Users;