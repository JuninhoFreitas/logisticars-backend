import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prisma.js";

class CategoriaController {

  async list(req, res, next) {
    console.log("Caller", res.locals.payload); // just to see the payload

    try {
      const categoria = await prisma.categorias.findMany();
      if (!categoria)
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Erro ao listar categorias",
        });
      return res
        .status(StatusCodes.OK)
        .json(categoria);
    } catch (err) {
      console.error(err);
      return next({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });
    }
  }


  async getById(req, res, next) {
    console.log("Caller", res.locals.payload); // just to see the payload

    try {
      const categoria = await prisma.categorias.findUnique({
        where: { id_categoria: req.params.id },
      });
      if (!categoria)
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Erro ao adicionar categoria",
        });
      return res
        .status(StatusCodes.OK)
        .json(categoria);
    } catch (err) {
      console.error(err);
      return next({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });
    }
  }

  async addNew(req, res, next) {

    try {
      const categoria = await prisma.categorias.create({
        data: { nome: req.body.nome },
      });
      if (!categoria)
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Categoria não adicionada",
        });
      return res
        .status(StatusCodes.OK)
        .json(categoria);
    } catch (err) {
      console.error(err);
      return next({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });
    }
  }


  async edit(req, res, next) {

    try {
      const categoria = await prisma.categorias.update({
        where: { id_categoria: req.params.id },
        data: { nome: req.body.nome },
      });
      if (!categoria)
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Categoria não atualizada",
        });
      return res
        .status(StatusCodes.OK)
        .json(categoria);
    } catch (err) {
      console.error(err);
      return next({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });
    }
  }


}





export default new CategoriaController();
