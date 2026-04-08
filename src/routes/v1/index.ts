import { Router } from 'express';
import attendanceRoutes from './attendance.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/attendance', attendanceRoutes);
router.use('/users', userRoutes);

export default router;
