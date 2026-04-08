import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    deviceUserId: z.string().min(1, 'deviceUserId is required'),
    username: z.string().min(3, 'username must be at least 3 characters').optional(),
    password: z.string().min(6, 'password must be at least 6 characters').optional(),
    name: z.string().min(1, 'name is required'),
    email: z.string().email().optional(),
    role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'username is required'),
    password: z.string().min(1, 'password is required'),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'username must be at least 3 characters').optional(),
    password: z.string().min(6, 'password must be at least 6 characters').optional(),
    name: z.string().min(1, 'name is required').optional(),
    email: z.string().email().optional(),
    role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
  }),
});

export const assignDeviceSchema = z.object({
  body: z.object({
    deviceId: z.string().min(1),
  }),
});
