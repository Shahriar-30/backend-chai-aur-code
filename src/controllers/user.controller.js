import { asyncHandler } from "../utils/asyncHandler.js";
import { apiRes } from "../utils/apiRes.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");

    let accessToken = await user.generateAccessToken();
    let refreshToken = await user.generateRefreshToken();

    user.refreshToken = await refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);

    throw new apiError(500, "Something went wrong while generating Access and Refresh Token");
  }
};

// register user
export const resgisterUser = asyncHandler(async (req, res) => {
  // ===== Get Fields from Body =====
  let { userName, fullName, email, password } = req.body;

  // ===== Validate Required Fields =====
  if ([fullName, email, userName, password].some((field) => !field?.trim())) {
    throw new apiError(400, "All fields are required");
  }

  // ===== Check Existing User =====
  let existingUser = await User.findOne({
    // await was missing, find → findOne
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new apiError(409, "User with email or username already exists");
  }

  // ===== Get Files from Multer =====
  const avatarBuffer = req.files?.avatar?.[0]?.buffer;
  const coverImageBuffer = req.files?.coverImage?.[0]?.buffer;

  if (!avatarBuffer) {
    throw new apiError(400, "Avatar is required");
  }

  // ===== Upload to Cloudinary =====

  const avatarUpload = await uploadToCloudinary(avatarBuffer);

  const coverImageUpload = coverImageBuffer ? await uploadToCloudinary(coverImageBuffer) : null;

  // ===== Create User =====
  const newUser = await User.create({
    userName: userName.toLowerCase().trim(),
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password: password,
    avatar: avatarUpload.url,
    coverImage: coverImageUpload?.url || "",
  });

  // ===== Return User Without Sensitive Fields =====
  const createdUser = await User.findById(newUser._id).select("-password");

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  res.status(201).json(new apiRes("User Registered Successfully", createdUser));
});

// login user
export const loginUser = asyncHandler(async (req, res) => {
  let { email, userName, password } = req.body;

  if (!email && !userName) throw new apiError(400, "Email or userName is required");
  if (!password) throw new apiError(400, "Password is required");

  let user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new apiError(400, "User doesn't exist");
  }

  let isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) throw new apiError(400, "Invalid user credentials");

  let { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  let options = {
    httpOnly: true,
    secure: true,
  };
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiRes("User logged in successfully", { user: safeUser, accessToken, refreshToken }));
});

// logout user
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });

  let option = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new apiRes("User logged out", {}));
});

// refreshTheAccessToken
export const refreshAccessToken = asyncHandler(async (req, res) => {
  let token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) throw new apiError(400, "Unauthorized request");

  let decodedUser = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  if (!decodedUser) throw new apiError(400, "Invalid refresh token");

  let user = await User.findById(decodedUser._id).select("-password");
  if (!user) throw new apiError(400, "Invalid User by refresh token");

  if (token !== user?.refreshToken) throw new apiError(400, "Refresh token is expired or used");

  let { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  let option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new apiRes("Access token refreshed", {
        user,
        accessToken,
        refreshToken,
      })
    );
});

// update info
export const updateInfo = asyncHandler(async (req, res) => {
  let { fullName, email, newPassword, updateSectionName } = req.body;
  if (!updateSectionName) throw new apiError(400, "Update section name is required");

  let id = req.user._id;

  // update full name
  if (updateSectionName === "fullName") {
    if (!fullName) throw new apiError(400, "Full name is required");
    let user = await User.findByIdAndUpdate(
      id,
      {
        fullName,
      },
      {
        new: true,
      }
    ).select("-password");

    res.status(200).json(new apiRes("fullName updated successfully", user));
  }

  // update email
  if (updateSectionName === "email") {
    if (!email) throw new apiError(400, "Email is required to change password");

    let user = await User.findByIdAndUpdate(
      id,
      {
        email,
      },
      { new: true }
    ).select("-password");
    if (!user) throw new apiError(400, "Invalid email - no user found");

    res.status(200).json(new apiRes("Email updated successfully", user));
  }

  if (updateSectionName === "password") {
    // let isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!email) throw new apiError(400, "Email is required to change password");
    if (!newPassword) throw new apiError(400, "New password is required to change password");

    let user = await User.findOneAndUpdate(email, { password: newPassword }, { new: true }).select(
      "-password"
    );
    if (!user) throw new apiError(400, "Invalid email - no user found");

    // let user = await User.findByIdAndUpdate(id, { password: newPassword }, { new: true }).select("-password");

    return res.status(200).json(new apiRes("Password has been updated"));
  }
});
