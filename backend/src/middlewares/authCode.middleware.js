import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyCode = asyncHandler(async (req, res, next) => {
  const { code } = req.query;  
  const { verifiedCode } = req.body;  
  
  try {
    if (code !== verifiedCode) {
      return next(new ApiError(400, "Wrong verification code"));
    }
  
    return next();
  } catch (err) {
      console.error("Error during verification:", err);
    return next(new ApiError(400, "An error occurred while verifying the code"));
  }
});

export {verifyCode};