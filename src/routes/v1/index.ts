import { Router } from 'express';
import attendanceRoutes from './attendance.routes';
import attendanceMonitoringRoutes from '../../modules/attendance/attendance.monitoring';
import userRoutes from './user.routes';
import deviceRoutes from './devices.routes';
import departmentRoutes from './department.routes';
import designationRoutes from './designation.routes';

const router = Router();

router.use('/attendance', attendanceRoutes);
router.use('/attendance', attendanceMonitoringRoutes);
router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);
router.use('/departments', departmentRoutes);
router.use('/designations', designationRoutes);

export default router;
