import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";

import { StaffRoutes } from "../modules/staff/staff.route";
import { ServiceRoutes } from "../modules/service/service.route";
import { AppointmentRoutes } from "../modules/appointment/appointment.route";
import { ActivityLogRoutes } from "../modules/activityLog/activityLog.route";

export const router = Router();

interface IModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: IModuleRoute[] = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/user",
    route: userRoutes,
  },

  {
    path: "/staff",
    route: StaffRoutes,
  },
  {
    path: "/service",
    route: ServiceRoutes,
  },
  {
    path: "/appointment",
    route: AppointmentRoutes,
  },
  {
    path: "/activity-log",
    route: ActivityLogRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
