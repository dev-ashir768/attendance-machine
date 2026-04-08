"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDeviceSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        deviceUserId: zod_1.z.string().min(1, 'deviceUserId is required'),
        name: zod_1.z.string().min(1, 'name is required'),
        email: zod_1.z.string().email().optional(),
        role: zod_1.z.enum(['ADMIN', 'EMPLOYEE']).optional(),
    }),
});
exports.assignDeviceSchema = zod_1.z.object({
    body: zod_1.z.object({
        deviceId: zod_1.z.string().min(1),
    }),
});
