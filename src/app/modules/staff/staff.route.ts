import express from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { StaffValidation } from "./staff.validation";
import { StaffController } from "./staff.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";

const router = express.Router();

router.post("/create-staff", validateRequest(StaffValidation.createStaffZodSchema), checkAuth(UserRole.USER), StaffController.createStaff);

router.get("/",checkAuth(UserRole.USER), StaffController.getAllStaff);

router.get("/:id", checkAuth(UserRole.USER), StaffController.getSingleStaff);

router.patch(
  "/:id",
  validateRequest(StaffValidation.updateStaffZodSchema),
  checkAuth(UserRole.USER),
  StaffController.updateStaff,
);

router.delete("/:id", checkAuth(UserRole.USER), StaffController.deleteStaff);
export const StaffRoutes = router;
