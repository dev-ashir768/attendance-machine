import { Router } from 'express';
import { checkIn, checkOut, getAttendanceHistory } from '../../modules/attendance/attendance.controller';
import { authenticateDevice } from '../../middlewares/deviceAuth.middleware';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validateInput.middleware';
import { webhookPayloadSchema, reportQuerySchema } from '../../modules/attendance/attendance.schema';

const router = Router();

// Webhooks from Machine (Secured via API Key)
router.post('/check-in', authenticateDevice, validate(webhookPayloadSchema), checkIn);
router.post('/check-out', authenticateDevice, validate(webhookPayloadSchema), checkOut);

// Admin Dashboard Queries (Secured via JWT)
router.get('/history', authenticateJWT, validate(reportQuerySchema), getAttendanceHistory);

export default router;
