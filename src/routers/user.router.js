import { Router } from 'express';
import rescue from 'express-rescue';
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.js';

const userRouter = Router();

userRouter.route('/:id').get(authMiddleware, rescue(userController.getById));

export default userRouter;
