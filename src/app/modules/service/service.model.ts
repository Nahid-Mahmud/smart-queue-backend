
import { model, Schema } from "mongoose";
import { IService } from "./service.interface";

const serviceSchema = new Schema<IService>(
  {
    serviceName: { type: String, required: true },
    duration: { type: Number, enum: [15, 30, 60], required: true },
    requiredStaffType: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Service = model<IService>("Service", serviceSchema);
export default Service;
