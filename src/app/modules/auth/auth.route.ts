import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { resetPasswordZodSchema, userLoginJodValidation } from "./auth.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post("/login", validateRequest(userLoginJodValidation), authController.credentialLogin);
router.post("/refresh-token", authController.generateAccessTokenFromRefreshToken);
router.post("/logout", authController.logout);

router.patch(
  "/reset-password",
  validateRequest(resetPasswordZodSchema),
  checkAuth(...Object.values(UserRole)),
  authController.resetPassword
);

router.patch("/change-password", checkAuth(...Object.values(UserRole)), authController.changePassword);

router.post("/forgot-password", authController.forgotPassword);

export const authRoutes = router;
