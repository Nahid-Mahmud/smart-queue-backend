/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { authService } from "./auth.service";
import { setAuthCookie } from "../../utils/setAuthCookie";
import { generateAuthTokens } from "../../utils/userTokens";
import { IUser } from "../user/user.interface";
import envVariables from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";

const credentialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = (await authService.credentialLogin(req, res, next)) as Partial<IUser>;

  const authTokens = generateAuthTokens(result as Partial<IUser>);

  setAuthCookie(res, {
    accessToken: authTokens.accessToken,
    refreshToken: authTokens.refreshToken,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      ...result,
      accessToken: authTokens.accessToken,
      refreshToken: authTokens.refreshToken,
    },
  });
});

const generateAccessTokenFromRefreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  const response = await authService.generateAccessTokenFromRefreshToken(refreshToken);

  setAuthCookie(res, {
    accessToken: response,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Access token generated successfully",
    data: {
      accessToken: response,
    },
  });
});

const logout = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "none", 
    secure: true,
  });

  sendResponse(res, {
    success: true,
    message: "User logged out successfully",
    statusCode: StatusCodes.OK,
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const decodedToken = req.user;

  const { newPassword, id } = req.body;

  await authService.resetPassword(newPassword, id, decodedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    message: "Password reset successfully",
    statusCode: StatusCodes.OK,
    data: null,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const decodedToken = req.user;

  const { oldPassword, newPassword } = req.body;

  await authService.changePassword(oldPassword, newPassword, decodedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    message: "Password reset successfully",
    statusCode: StatusCodes.OK,
    data: null,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Email is required");
  }

  // Call the service to handle forgot password logic
  await authService.forgotPassword(email);

  sendResponse(res, {
    success: true,
    message: "Password reset email sent successfully",
    statusCode: StatusCodes.OK,
    data: null,
  });
});

export const authController = {
  credentialLogin,
  generateAccessTokenFromRefreshToken,
  logout,
  resetPassword,
  changePassword,
  forgotPassword,
};
