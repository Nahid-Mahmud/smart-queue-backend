import express from 'express';
import { ActivityLogController } from './activityLog.controller';
import { checkAuth } from '../../middlewares/checkAuth';
import { UserRole } from '../user/user.interface';

const router = express.Router();

router.get('/', checkAuth(UserRole.USER), ActivityLogController.getAllLogs);

export const ActivityLogRoutes = router;
