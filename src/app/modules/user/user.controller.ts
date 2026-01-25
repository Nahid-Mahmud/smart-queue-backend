/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { IUser } from "./user.interface";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { userService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

// create user

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<IUser>;
  const result = await userService.createUser(payload);

  sendResponse(res, {
    success: true,
    message: "User created successfully. Check Your Email for OTP",
    data: result,
    statusCode: StatusCodes.CREATED,
  });
});

// update user

const updateUser = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.params.userId;

  const decodedToken = req.user;

  const payload = { ...req.body, profilePicture: req.file?.path };

  // console.log("profilePhoto:", req.file?.path);

  const user = await userService.updateUser(userId, payload, decodedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    message: "User updated successfully",
    data: user,
    statusCode: StatusCodes.OK,
  });
});

// get all users
const getAllUsers = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  const result = await userService.getAllUsers();
  sendResponse(res, {
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    statusCode: StatusCodes.OK,
    meta: {
      total: result.meta,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const decodedToken = req.user as JwtPayload;
  const user = await userService.getMe(decodedToken.userId);
  sendResponse(res, {
    success: true,
    message: "User retrieved successfully",
    data: user,
    statusCode: StatusCodes.OK,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.params.userId;
  const user = await userService.getUserById(userId);
  sendResponse(res, {
    success: true,
    message: "User retrieved successfully",
    data: user,
    statusCode: StatusCodes.OK,
  });
});

export const userController = {
  createUser,
  updateUser,
  getAllUsers,
  getMe,
  getUserById,
};
