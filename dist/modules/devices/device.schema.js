"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceQuerySchema = exports.updateDeviceSchema = exports.createDeviceSchema = void 0;
const zod_1 = require("zod");
exports.createDeviceSchema = zod_1.z.object({
    body: zod_1.z.object({
        deviceId: zod_1.z.string().min(1, 'deviceId is required'),
        name: zod_1.z.string().min(1, 'name is required'),
        ipAddress: zod_1.z.string().ip('Invalid IP address').optional(),
        location: zod_1.z.string().optional(),
    }),
});
exports.updateDeviceSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'name is required').optional(),
        ipAddress: zod_1.z.string().ip('Invalid IP address').optional(),
        location: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.deviceQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Page must be greater than 0').optional(),
        limit: zod_1.z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').optional(),
        isActive: zod_1.z.enum(['true', 'false']).optional(),
    }),
});
