import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ActivityLogService } from './activityLog.service';

const getAllLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityLogService.getAllLogsFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Activity logs retrieved successfully',
    data: result,
  });
});

export const ActivityLogController = {
  getAllLogs,
};
