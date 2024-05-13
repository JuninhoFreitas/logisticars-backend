import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma.js';
import jwt from '../utils/jwt.js';

class AuthController {
  async authenticate(req, res, next) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return next({
        status: StatusCodes.BAD_REQUEST,
        message: 'Faltam alguns campos',
      });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      return next({
        status: StatusCodes.NOT_FOUND,
        message: 'Usuário não encontrado',
      });
    }

    const isValidPassword = await bcrypt.compare(senha, user.senha);

    if (!isValidPassword) {
      return next({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Senha inválida',
      });
    }

    const token = jwt.sign({ id_usuario: user.id_usuario, email: user.email });

    res.status(StatusCodes.OK).json({ token });
  }
  async register(req, res, next) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return next({
        status: StatusCodes.BAD_REQUEST,
        message: 'Some required fields are missing',
      });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });

    if (user) {
      return next({
        status: StatusCodes.CONFLICT,
        message: 'Email já cadastrado',
      });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    try{
      const { id_usuario } = await prisma.usuario.create({
        data: { email, senha: hashedPassword},
      });
      return res.status(StatusCodes.CREATED).send({ id_usuario });
    }catch(err){
      console.log(err)
      return next({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Erro ao criar usuário',
      });
    }
  }
}

export default new AuthController();