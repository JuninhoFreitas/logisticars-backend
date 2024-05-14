import { Router } from "express";
import rescue from "express-rescue";
import categoriaController from "../controllers/categoria.controller.js";
import authMiddleware from "../middlewares/auth.js";
import categoriaValidation from "./categoria.validation.js";

const categoriaRouter = Router();


categoriaRouter
  .route("/")
  .post(
    categoriaValidation.addNew,
    authMiddleware,
    rescue(categoriaController.addNew),
  );

categoriaRouter
  .route("/:id")
  .get(
    categoriaValidation.getById,
    authMiddleware,
    rescue(categoriaController.getById),
  );

categoriaRouter
  .route("/:id")
  .put(
    categoriaValidation.edit,
    authMiddleware,
    rescue(categoriaController.edit),
  );

categoriaRouter
  .route("/")
  .get(
    categoriaValidation.list,
    authMiddleware,
    rescue(categoriaController.list),
  );


export default categoriaRouter;
