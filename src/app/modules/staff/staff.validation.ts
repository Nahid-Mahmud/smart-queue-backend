import { z } from 'zod';

const createStaffZodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  dailyCapacity: z.number().optional(),
  availabilityStatus: z.enum(['Available', 'On Leave']).optional(),
});

const updateStaffZodSchema = z.object({
  name: z.string().optional(),
  serviceType: z.string().optional(),
  dailyCapacity: z.number().optional(),
  availabilityStatus: z.enum(['Available', 'On Leave']).optional(),
});

export const StaffValidation = {
  createStaffZodSchema,
  updateStaffZodSchema,
};
