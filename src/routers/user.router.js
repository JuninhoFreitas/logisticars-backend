import { Router } from 'express';
import rescue from 'express-rescue';
import usuarioController from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.js';

const usuarioRouter = Router();

usuarioRouter.route('/:id').get(authMiddleware, rescue(usuarioController.getById));

export default usuarioRouter;
