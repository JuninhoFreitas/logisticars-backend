import { Router } from "express";
import { celebrate, Joi, errors, Segments } from "celebrate";
import rescue from "express-rescue";
import authController from "../controllers/auth.controller.js";
import authSchemaValidation from "./auth.validation.js";

const authRouter = Router();

authRouter
  .route("/login")
  .post(authSchemaValidation.login, rescue(authController.authenticate));
authRouter
  .route("/register")
  .post(authSchemaValidation.register, rescue(authController.register));

export default authRouter;
