
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AppointmentService } from "./appointment.service";

const createAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentService.createAppointmentIntoDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Appointment created successfully",
    data: result,
  });
});

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentService.getAllAppointmentsFromDB(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

const getSingleAppointment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AppointmentService.getSingleAppointmentFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Appointment retrieved successfully",
    data: result,
  });
});

const updateAppointment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AppointmentService.updateAppointmentIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Appointment updated successfully",
    data: result,
  });
});

const assignFromQueue = catchAsync(async (req: Request, res: Response) => {
  const { staffId } = req.body;
  const result = await AppointmentService.assignFromQueue(staffId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Staff assigned from queue successfully",
    data: result,
  });
});

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentService.getDashboardStats();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Dashboard stats retrieved successfully",
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
