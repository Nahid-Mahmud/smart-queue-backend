import z from "zod";
import { passwordZodValidationSchema } from "../user/user.validation";

export const userLoginJodValidation = z.object({
  email: z.email().min(1, "Email is required").max(100, "Email must be less than 100 characters"),
  password: z.string(),
});

export const resetPasswordZodSchema = z.object({
  newPassword: passwordZodValidationSchema,
  id: z.string().min(1, { message: "User ID is required" }),
});
