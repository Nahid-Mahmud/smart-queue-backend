import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import ActivityLog from "../activityLog/activityLog.model";
import { IService } from "../service/service.interface";
import Staff from "../staff/staff.model";
import User from "../user/user.model";
import Service from "../service/service.model";
import { IAppointment } from "./appointment.interface";
import Appointment from "./appointment.model";

const getTimeAfterMinutes = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + durationMinutes);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const isTimeOverlap = (
  newStartTime: string | undefined,
  newEndTime: string | undefined,
  existingStartTime: string | undefined,
  existingEndTime: string | undefined,
) => {
  const timeToMinutes = (time: string | undefined) => {
    if (!time) return 0;
    const parts = time.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  };

  const start1 = timeToMinutes(newStartTime);
  const end1 = timeToMinutes(newEndTime);
  const start2 = timeToMinutes(existingStartTime);
  const end2 = timeToMinutes(existingEndTime);

  return start1 < end2 && end1 > start2;
};

const createAppointmentIntoDB = async (payload: IAppointment, userId: string) => {
  // Validate createdBy user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  payload.createdBy = new Types.ObjectId(userId);
  if (payload.assignedStaff) {
    // 1. Check Staff Capacity
    const appointmentCount = await Appointment.countDocuments({
      assignedStaff: new Types.ObjectId(payload.assignedStaff),
      appointmentDate: payload.appointmentDate,
      status: { $ne: "Cancelled" },
      isDeleted: false,
      createdBy: userId,
    });

    const staff = await Staff.findById(payload.assignedStaff);
    if (!staff) {
      throw new AppError(httpStatus.NOT_FOUND, "Staff not found");
    }

    if (appointmentCount >= staff.dailyCapacity) {
      throw new AppError(
        httpStatus.CONFLICT,
        `Staff member ${staff.name} has reached their daily capacity of ${staff.dailyCapacity} appointments.`,
      );
    }

    // 2. Conflict Detection
    const service = await Service.findById(payload.service);
    if (!service) {
      throw new AppError(httpStatus.NOT_FOUND, "Service not found");
    }

    // Calculate end time
    payload.appointmentEndTime = getTimeAfterMinutes(payload.appointmentStartTime as string, service.duration);

    const existingAppointments = await Appointment.find({
      assignedStaff: new Types.ObjectId(payload.assignedStaff),
      appointmentDate: payload.appointmentDate,
      status: { $ne: "Cancelled" },
      isDeleted: false,
    }).populate("service");

    for (const app of existingAppointments) {
      if (
        isTimeOverlap(
          payload.appointmentStartTime,
          payload.appointmentEndTime,
          app.appointmentStartTime,
          app.appointmentEndTime,
        )
      ) {
        throw new AppError(
          httpStatus.CONFLICT,
          `This staff member already has an appointment ("${app.customerName}") that overlaps with this time.`,
        );
      }
    }
  } else {
    // 3. Waiting Queue Management
    const lastInQueue = await Appointment.findOne({
      appointmentDate: payload.appointmentDate,
      $or: [{ assignedStaff: { $exists: false } }, { assignedStaff: null }],
    }).sort("-queuePosition");

    payload.queuePosition = lastInQueue ? (lastInQueue.queuePosition || 0) + 1 : 1;

    const service = await Service.findById(payload.service);
    if (!service) {
      throw new AppError(httpStatus.NOT_FOUND, "Service not found");
    }
    payload.appointmentEndTime = getTimeAfterMinutes(payload.appointmentStartTime as string, service.duration);
  }

  const result = await Appointment.create(payload);

  // Log activity
  if (payload.assignedStaff) {
    const staff = await Staff.findById(payload.assignedStaff);
    await ActivityLog.create({
      action: "Appointment Created",
      details: `Appointment for "${payload.customerName}" assigned to ${staff?.name}.`,
    });
  } else {
    await ActivityLog.create({
      action: "Queue Entry",
      details: `Appointment for "${payload.customerName}" added to waiting queue.`,
    });
  }

  return result;
};

const getAllAppointmentsFromDB = async (query: Record<string, unknown>, userId: string) => {
  const result = await Appointment.find({ isDeleted: false, createdBy: userId, ...query })
    .populate("service")
    .populate("assignedStaff");
  return result;
};

const getSingleAppointmentFromDB = async (id: string, userId: string) => {
  const result = await Appointment.findOne({ _id: id, createdBy: userId })
    .populate("service")
    .populate("assignedStaff");
  return result;
};

const updateAppointmentIntoDB = async (id: string, payload: Partial<IAppointment>, userId: string) => {
  // Logic for conflict detection on update
  if (payload.assignedStaff || payload.appointmentStartTime || payload.appointmentEndTime || payload.appointmentDate) {
    const currentAppointment = await Appointment.findOne({ _id: id, createdBy: userId });
    if (!currentAppointment) {
      throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
    }

    const assignedStaff = payload.assignedStaff || currentAppointment.assignedStaff;
    const appointmentDate = payload.appointmentDate || currentAppointment.appointmentDate;

    const serviceId = payload.service || currentAppointment.service;
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new AppError(httpStatus.NOT_FOUND, "Service not found");
    }

    // Always recalculate end time if start time or service changed
    if (payload.appointmentStartTime || payload.service) {
      const startTime = payload.appointmentStartTime || currentAppointment.appointmentStartTime;
      if (!startTime) {
        throw new AppError(httpStatus.BAD_REQUEST, "Appointment start time is required");
      }
      payload.appointmentEndTime = getTimeAfterMinutes(startTime, service.duration);
    }

    const appointmentStartTime = payload.appointmentStartTime || currentAppointment.appointmentStartTime;
    const appointmentEndTime = payload.appointmentEndTime || currentAppointment.appointmentEndTime;

    if (assignedStaff) {
      // Check Staff Capacity if staff or date changed
      if (payload.assignedStaff || payload.appointmentDate) {
        const appointmentCount = await Appointment.countDocuments({
          assignedStaff: new Types.ObjectId(assignedStaff),
          appointmentDate,
          status: { $ne: "Cancelled" },
          isDeleted: false,
          _id: { $ne: id },
        });

        const staff = await Staff.findById(assignedStaff);
        if (!staff) {
          throw new AppError(httpStatus.NOT_FOUND, "Staff not found");
        }

        if (appointmentCount >= staff.dailyCapacity) {
          throw new AppError(
            httpStatus.CONFLICT,
            `Staff member ${staff.name} has reached their daily capacity of ${staff.dailyCapacity} appointments.`,
          );
        }
      }

      const serviceId = payload.service || currentAppointment.service;
      const service = await Service.findById(serviceId);
      if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, "Service not found");
      }

      const existingAppointments = await Appointment.find({
        _id: { $ne: id },
        assignedStaff: new Types.ObjectId(assignedStaff),
        appointmentDate,
        status: { $ne: "Cancelled" },
        isDeleted: false,
      }).populate("service");

      for (const app of existingAppointments) {
        if (isTimeOverlap(appointmentStartTime, appointmentEndTime, app.appointmentStartTime, app.appointmentEndTime)) {
          throw new AppError(
            httpStatus.CONFLICT,
            `This staff member already has an appointment ("${app.customerName}") that overlaps with this time.`,
          );
        }
      }
    }
  }

  const result = await Appointment.findOneAndUpdate({ _id: id, createdBy: userId }, payload, { new: true });
  return result;
};

const assignFromQueue = async (staffId: string, userId: string, appointmentId?: string) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new AppError(httpStatus.NOT_FOUND, "Staff not found");
  }

  // Check Staff Capacity
  const appointmentCount = await Appointment.countDocuments({
    assignedStaff: new Types.ObjectId(staffId),
    appointmentDate: new Date().toISOString().split("T")[0], // today's date
    status: { $ne: "Cancelled" },
    isDeleted: false,
    createdBy: userId,
  });

  if (appointmentCount >= staff.dailyCapacity) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Staff member ${staff.name} has reached their daily capacity of ${staff.dailyCapacity} appointments.`,
    );
  }

  let eligibleAppointment;

  if (appointmentId) {
    eligibleAppointment = await Appointment.findOne({
      _id: appointmentId,
      createdBy: userId,
      $or: [{ assignedStaff: { $exists: false } }, { assignedStaff: null }],
    }).populate("service");

    if (!eligibleAppointment) {
      throw new AppError(httpStatus.NOT_FOUND, "The specified appointment is not in the queue.");
    }

    if ((eligibleAppointment.service as unknown as IService).requiredStaffType !== staff.serviceType) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `This staff member cannot handle ${(eligibleAppointment.service as unknown as IService).serviceName} services.`,
      );
    }

    // Ensure times are set
    if (!eligibleAppointment.appointmentStartTime || !eligibleAppointment.appointmentEndTime) {
      const service = eligibleAppointment.service as unknown as IService;
      eligibleAppointment.appointmentStartTime = "09:00";
      eligibleAppointment.appointmentEndTime = getTimeAfterMinutes("09:00", service.duration);
    }
  } else {
    // Find the earliest appointment in queue that matches staff's service type AND has no conflict
    const appointmentsInQueue = await Appointment.find({
      $or: [{ assignedStaff: { $exists: false } }, { assignedStaff: null }],
      isDeleted: false,
      createdBy: userId,
    })
      .populate("service")
      .sort("queuePosition");

    for (const app of appointmentsInQueue) {
      const service = app.service as unknown as IService;
      if (service.requiredStaffType === staff.serviceType && app.appointmentStartTime && app.appointmentEndTime) {
        // Check for conflict at this appointment's time
        const existingAppointments = await Appointment.find({
          assignedStaff: new Types.ObjectId(staffId),
          appointmentDate: app.appointmentDate,
          status: { $ne: "Cancelled" },
        }).populate("service");

        let hasConflict = false;
        for (const existingApp of existingAppointments) {
          if (
            isTimeOverlap(
              app.appointmentStartTime,
              app.appointmentEndTime,
              existingApp.appointmentStartTime,
              existingApp.appointmentEndTime,
            )
          ) {
            hasConflict = true;
            break;
          }
        }

        if (!hasConflict) {
          eligibleAppointment = app;
          break;
        }
      }
    }

    if (!eligibleAppointment) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "No eligible appointments in queue without conflicts for this staff member.",
      );
    }
  }

  eligibleAppointment.assignedStaff = new Types.ObjectId(staffId);
  eligibleAppointment.queuePosition = undefined;
  await eligibleAppointment.save();

  await ActivityLog.create({
    action: "Queue -> Staff assignment",
    details: `Appointment for "${eligibleAppointment.customerName}" auto-assigned to ${staff.name}.`,
  });

  return eligibleAppointment;
};

const getDashboardStats = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0];
  const totalToday = await Appointment.countDocuments({ appointmentDate: today, isDeleted: false, createdBy: userId });
  const completed = await Appointment.countDocuments({
    appointmentDate: today,
    status: "Completed",
    isDeleted: false,
    createdBy: userId,
  });
  const pending = await Appointment.countDocuments({
    appointmentDate: today,
    status: "Scheduled",
    isDeleted: false,
    createdBy: userId,
  });
  const queueCount = await Appointment.countDocuments({
    appointmentDate: today,
    $or: [{ assignedStaff: { $exists: false } }, { assignedStaff: null }],
    isDeleted: false,
    createdBy: userId,
  });

  // Staff load - but staff are per user? In staff, addedBy is userId, so filter staff by addedBy.
  const staffs = await Staff.find({ isDeleted: false, availabilityStatus: "Available", addedBy: userId });
  const staffLoad = await Promise.all(
    staffs.map(async (s) => {
      const count = await Appointment.countDocuments({
        assignedStaff: s._id,
        appointmentDate: today,
        status: { $ne: "Cancelled" },
        createdBy: userId,
      });
      return {
        name: s.name,
        count,
        capacity: s.dailyCapacity,
        status: count >= s.dailyCapacity ? "Booked" : "OK",
      };
    }),
  );

  return {
    totalToday,
    completed,
    pending,
    queueCount,
    staffLoad,
  };
};

export const AppointmentService = {
  createAppointmentIntoDB,
  getAllAppointmentsFromDB,
  getSingleAppointmentFromDB,
  updateAppointmentIntoDB,
  assignFromQueue,
  getDashboardStats,
};
