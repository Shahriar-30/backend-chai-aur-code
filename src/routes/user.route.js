import express from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  resgisterUser,
} from "../controllers/user.controller.js";
import upload from "../middlewares/uploader.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";

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

userRouter.route("/login").post(loginUser);

userRouter.route("/logout").post(jwtVerify, logoutUser);

userRouter.route("/refreshaccesstoken").post(refreshAccessToken);

export default userRouter;
