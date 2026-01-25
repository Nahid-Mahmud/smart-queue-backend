import { Types } from "mongoose";

export type TAppointmentStatus = "Scheduled" | "Completed" | "Cancelled" | "No-Show";

export interface IAppointment {
  customerName: string;
  service: Types.ObjectId; // Reference to Service
  assignedStaff?: Types.ObjectId; // Reference to Staff, optional if in queue
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  status: TAppointmentStatus;
  isDeleted: boolean;
  queuePosition?: number;
}
