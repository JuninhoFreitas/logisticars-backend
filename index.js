import cors from 'cors';
import express from 'express';
import mainDB from './lib/prisma.js';
import { checkToken, passwordEnc, setToken } from './lib/utils.js';
import { SESSIONS } from './memory/memories.js';
import Users from './routes/users.js';

const app = express();      // Define o server
app.use(cors());            // Define CORS como permitido
app.use(express.json());    // Define o meddleware de comunicação JSON

app.post('/login', Users.login);

app.get('/check-auth', Users.checkAuth)

app.get('/logout', Users.logout);

app.post('/change-password',Users.changePassword);

app.get('/', async (req, res) => {
    res.status(200).send("running");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});