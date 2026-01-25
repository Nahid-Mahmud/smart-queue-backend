import { Types } from "mongoose";

export type TAvailabilityStatus = "Available" | "On Leave";

export interface IStaff {
  name: string;
  serviceType: string; // e.g., Doctor, Consultant
  dailyCapacity: number; // default 5
  availabilityStatus: TAvailabilityStatus;
  isDeleted: boolean;
  addedBy: Types.ObjectId;
}
