import { z } from "zod";

const createAppointmentZodSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  service: z.string().min(1, "Service ID is required"),
  assignedStaff: z.string().optional(),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentStartTime: z.string().min(1, "Appointment start time is required"),
  appointmentEndTime: z.string().optional(),
  status: z.enum(["Scheduled", "Completed", "Cancelled", "No-Show"]).optional(),
});

const updateAppointmentZodSchema = z.object({
  customerName: z.string().optional(),
  service: z.string().optional(),
  assignedStaff: z.string().optional(),
  appointmentDate: z.string().optional(),
  appointmentStartTime: z.string().optional(),
  appointmentEndTime: z.string().optional(),
  status: z.enum(["Scheduled", "Completed", "Cancelled", "No-Show"]).optional(),
});

export const AppointmentValidation = {
  createAppointmentZodSchema,
  updateAppointmentZodSchema,
};
