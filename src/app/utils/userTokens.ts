import { StatusCodes } from "http-status-codes";
import envVariables from "../config/env";
import AppError from "../errorHelpers/AppError";
import { IsActive, IUser } from "../modules/user/user.interface";

import { generateJwtToken, verifyJwtToken } from "./jwt";
import User from "../modules/user/user.model";

export const generateAuthTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateJwtToken(
    jwtPayload,
    envVariables.ACCESS_TOKEN_JWT_SECRET,
    envVariables.ACCESS_TOKEN_JWT_EXPIRATION
  );

  const refreshToken = generateJwtToken(
    jwtPayload,
    envVariables.REFRESH_TOKEN_JWT_SECRET,
    envVariables.REFRESH_TOKEN_JWT_EXPIRATION
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const createNewRefreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Refresh token is required");
  }

  const decodedToken = verifyJwtToken(refreshToken, envVariables.REFRESH_TOKEN_JWT_SECRET);

  //  check if user exists
  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User not found");
  }

  // check if user is blocked or deleted

  if (user.isActive === IsActive.BLOCKED) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User is blocked");
  }
  if (user.isActive === IsActive.INACTIVE) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User is inactive");
  }

  if (user.isDeleted) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User is deleted");
  }

  const newAccessToken = generateJwtToken(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    envVariables.ACCESS_TOKEN_JWT_SECRET,
    envVariables.ACCESS_TOKEN_JWT_EXPIRATION
  );
  return newAccessToken;
};
