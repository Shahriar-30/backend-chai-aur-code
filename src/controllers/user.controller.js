import { asyncHandler } from "../utils/asyncHandler.js";

export const resgisterUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "server is working fine",
  });
});
