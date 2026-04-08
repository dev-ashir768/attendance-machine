"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("../../modules/attendance/attendance.controller");
const deviceAuth_middleware_1 = require("../../middlewares/deviceAuth.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validateInput_middleware_1 = require("../../middlewares/validateInput.middleware");
const attendance_schema_1 = require("../../modules/attendance/attendance.schema");
const router = (0, express_1.Router)();
// Webhooks from Machine (Secured via API Key)
router.post('/check-in', deviceAuth_middleware_1.authenticateDevice, (0, validateInput_middleware_1.validate)(attendance_schema_1.webhookPayloadSchema), attendance_controller_1.checkIn);
router.post('/check-out', deviceAuth_middleware_1.authenticateDevice, (0, validateInput_middleware_1.validate)(attendance_schema_1.webhookPayloadSchema), attendance_controller_1.checkOut);
// Admin Dashboard Queries (Secured via JWT)
router.get('/history', auth_middleware_1.authenticateJWT, (0, validateInput_middleware_1.validate)(attendance_schema_1.reportQuerySchema), attendance_controller_1.getAttendanceHistory);
router.get('/sessions', auth_middleware_1.authenticateJWT, (0, validateInput_middleware_1.validate)(attendance_schema_1.reportQuerySchema), attendance_controller_1.getAttendanceSessions);
router.get('/summary', auth_middleware_1.authenticateJWT, (0, validateInput_middleware_1.validate)(attendance_schema_1.reportQuerySchema), attendance_controller_1.getAttendanceSummary);
exports.default = router;
