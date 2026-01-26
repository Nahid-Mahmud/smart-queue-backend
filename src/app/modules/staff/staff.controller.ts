import { Request, Response } from "express";
import { Types } from "mongoose";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { StaffService } from "./staff.service";
import { JwtPayload } from "jsonwebtoken";

const createStaff = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const payload = { ...req.body, addedBy: new Types.ObjectId(decodedToken.userId) };
  const result = await StaffService.createStaffIntoDB(payload);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Staff created successfully",
    data: result,
  });
});

const getAllStaff = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const result = await StaffService.getAllStaffFromDB(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Staff retrieved successfully",
    data: result,
  });
});

const getSingleStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const result = await StaffService.getSingleStaffFromDB(id, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Staff retrieved successfully",
    data: result,
  });
});

const updateStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as JwtPayload).userId;

  const result = await StaffService.updateStaffIntoDB(id, req.body, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Staff updated successfully",
    data: result,
  });
});

const deleteStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as JwtPayload).userId;
  const result = await StaffService.deleteStaffFromDB(id, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Staff deleted successfully",
    data: result,
  });
});

export const StaffController = {
  createStaff,
  getAllStaff,
  getSingleStaff,
  updateStaff,
  deleteStaff,
};
