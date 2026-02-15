import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

let app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// import routers
import userRouter from "./routes/user.route.js";

// use routers
app.use("/api/v1/users", userRouter);

export { app };
