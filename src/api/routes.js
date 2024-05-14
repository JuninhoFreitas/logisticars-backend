import { Router } from "express";
import authRouter from "../routers/auth.router.js";
import userRouter from "../routers/user.router.js";
import itemRouter from "../routers/item.router.js";
import categoriaRouter from "../routers/categoria.router.js";

const router = Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/itens", itemRouter);
router.use("/categorias", categoriaRouter);
export default router;
