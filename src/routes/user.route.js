import express from "express";
import { resgisterUser } from "../controllers/user.controller.js";
import upload from "../middlewares/uploader.js";

const userRouter = express.Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  resgisterUser
);

export default userRouter;
