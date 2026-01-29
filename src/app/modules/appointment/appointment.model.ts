import { model, Schema } from 'mongoose';
import { IAppointment } from './appointment.interface';

const appointmentSchema = new Schema<IAppointment>(
  {
    customerName: { type: String, required: true },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    assignedStaff: { type: Schema.Types.ObjectId, ref: 'Staff' },
    appointmentDate: { type: String, required: true },
    appointmentStartTime: { type: String, required: false },
    appointmentEndTime: { type: String, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'No-Show'],
      default: 'Scheduled',
    },
    isDeleted: { type: Boolean, default: false },
    queuePosition: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Appointment = model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;
