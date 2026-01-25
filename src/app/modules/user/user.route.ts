import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateUserZodSchema, userCreateZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "./user.interface";


const router = Router();

// create user
router.post("/create", validateRequest(userCreateZodSchema), userController.createUser);

// update user
router.patch(
  "/:userId",
  checkAuth(...Object.values(UserRole)),
  validateRequest(updateUserZodSchema),
  userController.updateUser
);

// get All Users
router.get("/get-all", checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), userController.getAllUsers);

// get me route
router.get("/me", checkAuth(...Object.values(UserRole)), userController.getMe);

// get user by userID

router.get("/:userId", checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), userController.getUserById);

export const userRoutes = router;
