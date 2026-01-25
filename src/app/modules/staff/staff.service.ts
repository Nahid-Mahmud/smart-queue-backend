
import { IStaff } from "./staff.interface";
import Staff from "./staff.model";
import Appointment from "../appointment/appointment.model";

const createStaffIntoDB = async (payload: IStaff) => {
  const result = await Staff.create(payload);
  return result;
};

const getAllStaffFromDB = async () => {
  const staffs = await Staff.find({ isDeleted: false });
  const today = new Date().toISOString().split('T')[0];
  
  const staffWithCount = await Promise.all(staffs.map(async (staff) => {
    const appointmentCount = await Appointment.countDocuments({
      assignedStaff: staff._id,
      appointmentDate: today,
      status: { $ne: 'Cancelled' },
    });
    return {
      ...staff.toObject(),
      appointmentCount,
    };
  }));

  return staffWithCount;
};

const getSingleStaffFromDB = async (id: string) => {
  const result = await Staff.findById(id);
  return result;
};

const updateStaffIntoDB = async (id: string, payload: Partial<IStaff>) => {
  const result = await Staff.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteStaffFromDB = async (id: string) => {
  const result = await Staff.findByIdAndUpdate(
    id,
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
