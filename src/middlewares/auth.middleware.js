import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const jwtVerify = asyncHandler(async (req, res, next) => {
  const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new apiError(400, "Unauthorized access");
  console.log(token);

  let decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decodedUser) throw new apiError(400, "Invalid Access Token");

  let user = await User.findById(decodedUser._id);
  if (!user) throw new apiError(400, "Invalid user Access by token");

  req.user = user;
  next();
});
