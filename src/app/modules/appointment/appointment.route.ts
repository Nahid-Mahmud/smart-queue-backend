import express from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { AppointmentValidation } from "./appointment.validation";
import { AppointmentController } from "./appointment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";

const router = express.Router();

router.post(
  "/create-appointment",
  checkAuth(UserRole.USER),
  validateRequest(AppointmentValidation.createAppointmentZodSchema),
  AppointmentController.createAppointment,
);

router.get("/", checkAuth(UserRole.USER), AppointmentController.getAllAppointments);

router.get("/dashboard-stats", checkAuth(UserRole.USER), AppointmentController.getDashboardStats);

router.get("/:id", checkAuth(UserRole.USER), AppointmentController.getSingleAppointment);

router.patch(
  "/:id",
  checkAuth(UserRole.USER),
  validateRequest(AppointmentValidation.updateAppointmentZodSchema),
  AppointmentController.updateAppointment,
);

router.post("/assign-from-queue", checkAuth(UserRole.USER), AppointmentController.assignFromQueue);

export const AppointmentRoutes = router;
