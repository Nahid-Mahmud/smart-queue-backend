import { model, Schema } from "mongoose";
import { IActivityLog } from "./activityLog.interface";

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    details: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ActivityLog = model<IActivityLog>("ActivityLog", activityLogSchema);
export default ActivityLog;
