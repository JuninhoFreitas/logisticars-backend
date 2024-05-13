import { Router } from 'express';
import rescue from 'express-rescue';
import usuarioController from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.js';
import userValidation from './user.validation.js';

const usuarioRouter = Router();

usuarioRouter.route('/:id').get(userValidation.getById, authMiddleware, rescue(usuarioController.getById));

export default usuarioRouter;
