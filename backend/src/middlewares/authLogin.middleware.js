import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.authToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log('No token provided');
      return next(new ApiError(403, "Unauthorized request: Token missing"));
    }

    if (token.trim() === '') {
      console.log('Token is empty');
      return next(new ApiError(405, "Invalid token format: Token cannot be empty"));
    }

    // Verify the JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Token verified successfully for user ID: ${decodedToken.id}`);

    req.user = decodedToken;
    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error during JWT verification:', error?.message || error);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      console.log('Invalid or expired token');
      return next(new ApiError(406, "Invalid Access Token: " + (error.message || 'Token verification failed')));
    }

    console.error('An error occurred during token verification', error);
    return next(new ApiError(500, "An error occurred during token verification"));
  }
});