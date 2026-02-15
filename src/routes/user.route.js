import express from "express";
import { resgisterUser } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", resgisterUser);

export default userRouter;
