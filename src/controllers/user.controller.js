import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prisma.js";

class UserController {
  async getById(req, res, next) {
    console.log("payload", res.locals.payload); // just to see the payload

    try {
      const user = await prisma.usuario.findUnique({
        where: { id_usuario: req.params.id },
      });
      if (!user)
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Usuário não encontrado",
        });
      return res
        .status(StatusCodes.OK)
        .json({ nome: user.nome, email: user.email });
    } catch (err) {
      console.error(err);
      return next({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });
    }
  }
}

export default new UserController();
