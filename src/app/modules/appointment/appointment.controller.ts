import { Request, Response } from 'express';

import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AppointmentService } from './appointment.service';
import { JwtPayload } from 'jsonwebtoken';

const createAppointment = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  // const payload = { ...req.body, createdBy: new Types.ObjectId(decodedToken.userId) };
  const result = await AppointmentService.createAppointmentIntoDB(
    req.body,
    decodedToken.userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Appointment created successfully',
    data: result,
  });
});

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const result = await AppointmentService.getAllAppointmentsFromDB(
    req.query,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Appointments retrieved successfully',
    data: result,
  });
});

const getSingleAppointment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const result = await AppointmentService.getSingleAppointmentFromDB(
    id,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Appointment retrieved successfully',
    data: result,
  });
});

const updateAppointment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const result = await AppointmentService.updateAppointmentIntoDB(
    id,
    req.body,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Appointment updated successfully',
    data: result,
  });
});

const assignFromQueue = catchAsync(async (req: Request, res: Response) => {
  const { staffId, appointmentId } = req.body;
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const result = await AppointmentService.assignFromQueue(
    staffId,
    userId,
    appointmentId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Staff assigned from queue successfully',
    data: result,
  });
});

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const result = await AppointmentService.getDashboardStats(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: result,
  });
});

export const AppointmentController = {
  createAppointment,
  getAllAppointments,
  getSingleAppointment,
  updateAppointment,
  assignFromQueue,
  getDashboardStats,
};
