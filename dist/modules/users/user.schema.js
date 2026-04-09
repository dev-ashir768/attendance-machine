"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDeviceSchema = exports.updateUserSchema = exports.loginSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        deviceUserId: zod_1.z.string().min(1, 'deviceUserId is required'),
        username: zod_1.z.string().min(3, 'username must be at least 3 characters').optional(),
        password: zod_1.z.string().min(6, 'password must be at least 6 characters').optional(),
        name: zod_1.z.string().min(1, 'name is required'),
        email: zod_1.z.string().email().optional(),
        role: zod_1.z.enum(['ADMIN', 'EMPLOYEE']).optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(1, 'username is required'),
        password: zod_1.z.string().min(1, 'password is required'),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(3, 'username must be at least 3 characters').optional(),
        password: zod_1.z.string().min(6, 'password must be at least 6 characters').optional(),
        name: zod_1.z.string().min(1, 'name is required').optional(),
        email: zod_1.z.string().email().optional(),
        role: zod_1.z.enum(['ADMIN', 'EMPLOYEE']).optional(),
    }),
});
exports.assignDeviceSchema = zod_1.z.object({
    body: zod_1.z.object({
        deviceId: zod_1.z.string().min(1),
    }),
});
