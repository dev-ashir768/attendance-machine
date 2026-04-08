"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportQuerySchema = exports.webhookPayloadSchema = void 0;
const zod_1 = require("zod");
exports.webhookPayloadSchema = zod_1.z.object({
    body: zod_1.z.object({
        deviceUserId: zod_1.z.string().min(1, 'deviceUserId is required'),
        timestamp: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid date format',
        }),
        deviceId: zod_1.z.string().min(1, 'deviceId is required'),
    }),
});
exports.reportQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        date: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        userId: zod_1.z.string().optional(),
        deviceId: zod_1.z.string().optional(),
        status: zod_1.z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']).optional(),
        page: zod_1.z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Page must be greater than 0').optional(),
        limit: zod_1.z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').optional(),
        sortBy: zod_1.z.enum(['date', 'createdAt', 'checkInTime']).optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
