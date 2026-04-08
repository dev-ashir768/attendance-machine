import { Router } from 'express';
import attendanceRoutes from './attendance.routes';
import userRoutes from './user.routes';
import deviceRoutes from './devices.routes';

const router = Router();

router.use('/attendance', attendanceRoutes);
router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);

export default router;
