import express from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { AppointmentValidation } from "./appointment.validation";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();

router.post(
  "/create-appointment",
  validateRequest(AppointmentValidation.createAppointmentZodSchema),
  AppointmentController.createAppointment,
);

router.get("/", AppointmentController.getAllAppointments);

router.get("/dashboard-stats", AppointmentController.getDashboardStats);

router.get("/:id", AppointmentController.getSingleAppointment);

router.patch(
  "/:id",
  validateRequest(AppointmentValidation.updateAppointmentZodSchema),
  AppointmentController.updateAppointment,
);

router.post("/assign-from-queue", AppointmentController.assignFromQueue);

export const AppointmentRoutes = router;
