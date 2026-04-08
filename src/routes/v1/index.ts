import { Router } from 'express';
import attendanceRoutes from './attendance.routes';
import attendanceMonitoringRoutes from '../../modules/attendance/attendance.monitoring';
import userRoutes from './user.routes';
import deviceRoutes from './devices.routes';

const router = Router();

router.use('/attendance', attendanceRoutes);
router.use('/attendance', attendanceMonitoringRoutes);
router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);

export default router;
