import { model, Schema } from 'mongoose';
import { IStaff } from './staff.interface';

const staffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true },
    serviceType: { type: String, required: true },
    dailyCapacity: { type: Number, default: 1, min: 1, max: 5 },

    availabilityStatus: {
      type: String,
      enum: ['Available', 'On Leave'],
      default: 'Available',
    },
    isDeleted: { type: Boolean, default: false },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Staff = model<IStaff>('Staff', staffSchema);
export default Staff;
