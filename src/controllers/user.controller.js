import { asyncHandler } from "../utils/asyncHandler.js";
import { apiRes } from "../utils/apiRes.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

export const resgisterUser = asyncHandler(async (req, res) => {
  let { userName, fullName, avater, coverImage, email, password } = req.body;

  if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }

  let existingUser = User.find({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new apiError(400, "User with email or user name already existss");
  }

  let avaterMulter = req.files?.avater[0].path;

  if (!avaterMulter) {
    throw new apiError(400, "Avatar is required");
  }

  res.status(201).json(new apiRes("User Registered", { email, password }));
});
