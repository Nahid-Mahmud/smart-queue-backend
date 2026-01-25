import express from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { ServiceValidation } from "./service.validation";
import { ServiceController } from "./service.controller";

const router = express.Router();

router.post(
  "/create-service",
  validateRequest(ServiceValidation.createServiceZodSchema),
  ServiceController.createService,
);

router.get("/", ServiceController.getAllServices);

router.get("/:id", ServiceController.getSingleService);

router.patch("/:id", validateRequest(ServiceValidation.updateServiceZodSchema), ServiceController.updateService);

router.delete("/:id", ServiceController.deleteService);

export const ServiceRoutes = router;
