import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    deviceUserId: z.string().min(1, 'deviceUserId is required'),
    name: z.string().min(1, 'name is required'),
    email: z.string().email().optional(),
    role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
  }),
});

export const assignDeviceSchema = z.object({
  body: z.object({
    deviceId: z.string().min(1),
  }),
});
