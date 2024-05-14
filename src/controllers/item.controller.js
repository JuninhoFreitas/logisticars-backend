import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prisma.js";

class ItemController {
  async getById(req, res, next) {
    console.log("Caller", res.locals.payload); // just to see the payload

    try {
      const item = await prisma.item.findUnique({
        where: { id_item: req.params.id },
      });
      if (!item)
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Item não encontrado",
        });
      return res
        .status(StatusCodes.OK)
        .json(item);
    } catch (err) {
      console.error(err);
      return next({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });
    }
  }

  async addNew(req, res, next) {


    // checking if the category exists
    try{
      const category = await prisma.categorias.findFirst({
        where: { id_categoria: req.body.id_categoria },
      });
      if (!category)
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Categoria não encontrada",
        });
    } catch (err) {
      console.error(err);
      return next({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error 1",
      });
    }

    // adding the new item 
    try {
      const item = await prisma.item.create({
        data: { nome: req.body.nome, unidade_medida: req.body.unidade_medida, id_categoria: req.body.id_categoria},
      });
      if (!item)
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Categoria não adicionada",
        });
      return res
        .status(StatusCodes.OK)
        .json(item);
    } catch (err) {
      console.error(err);
      return next({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error 2",
      });
    }
  }





}

export default new ItemController();
