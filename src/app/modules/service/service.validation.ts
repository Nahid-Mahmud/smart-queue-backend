import { z } from 'zod';

const createServiceZodSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
  duration: z
    .number()
    .refine(
      (val) => [15, 30, 60].includes(val),
      'Duration must be 15, 30 or 60'
    ),
  requiredStaffType: z.string().min(1, 'Required Staff Type is required'),
});

const updateServiceZodSchema = z.object({
  serviceName: z.string().optional(),
  duration: z
    .number()
    .refine(
      (val) => [15, 30, 60].includes(val),
      'Duration must be 15, 30 or 60'
    )
    .optional(),
  requiredStaffType: z.string().optional(),
});

export const ServiceValidation = {
  createServiceZodSchema,
  updateServiceZodSchema,
};
