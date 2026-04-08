import { Router } from 'express';
import { checkIn, checkOut, getAttendanceHistory, getAttendanceSessions, getAttendanceSummary, getUserCheckInOut } from '../../modules/attendance/attendance.controller';
import { authenticateDevice } from '../../middlewares/deviceAuth.middleware';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validateInput.middleware';
import { webhookPayloadSchema, reportQuerySchema } from '../../modules/attendance/attendance.schema';

const router = Router();

// Webhooks from Machine (Secured via API Key)
router.post('/check-in', authenticateDevice, validate(webhookPayloadSchema), checkIn);
router.post('/check-out', authenticateDevice, validate(webhookPayloadSchema), checkOut);

// Admin Dashboard Queries (Secured via JWT)
router.get('/user-checkinout', authenticateJWT, getUserCheckInOut);
router.get('/history', authenticateJWT, validate(reportQuerySchema), getAttendanceHistory);
router.get('/sessions', authenticateJWT, validate(reportQuerySchema), getAttendanceSessions);
router.get('/summary', authenticateJWT, validate(reportQuerySchema), getAttendanceSummary);

export default router;
