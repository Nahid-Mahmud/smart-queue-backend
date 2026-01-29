import { IStaff } from './staff.interface';
import Staff from './staff.model';
import mongoose from 'mongoose';
import User from '../user/user.model';
import AppError from '../../errorHelpers/AppError';
import httpStatus from 'http-status-codes';

const createStaffIntoDB = async (payload: IStaff) => {
  // Validate addedBy user exists
  const user = await User.findById(payload.addedBy);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await Staff.create(payload);
  return result;
};

const getAllStaffFromDB = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];

  return await Staff.aggregate([
    // 1. Filter staff by owner and deletion status
    {
      $match: {
        addedBy: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      },
    },

    // 2. Left Outer Join with appointments
    {
      $lookup: {
        from: 'appointments', // Ensure this matches your collection name
        let: { staffId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$assignedStaff', '$$staffId'] },
                  { $eq: ['$appointmentDate', today] },
                  { $ne: ['$status', 'Cancelled'] },
                ],
              },
            },
          },
        ],
        as: 'appointments',
      },
    },

    // 3. Add the count field and remove the raw appointments array
    {
      $addFields: {
        appointmentCount: { $size: '$appointments' },
      },
    },
    { $project: { appointments: 0 } }, // Clean up payload
  ]);
};

const getSingleStaffFromDB = async (id: string, userId: string) => {
  const result = await Staff.findOne({ _id: id, addedBy: userId });
  return result;
};

const updateStaffIntoDB = async (
  id: string,
  payload: Partial<IStaff>,
  userId: string
) => {
  const result = await Staff.findOneAndUpdate(
    { _id: id, addedBy: userId },
    payload,
    { new: true }
  );
  return result;
};

const deleteStaffFromDB = async (id: string, userId: string) => {
  const result = await Staff.findOneAndUpdate(
    { _id: id, addedBy: userId },
    { isDeleted: true },
    { new: true }
  );
  return result;
};

export const StaffService = {
  createStaffIntoDB,
  getAllStaffFromDB,
  getSingleStaffFromDB,
  updateStaffIntoDB,
  deleteStaffFromDB,
};
