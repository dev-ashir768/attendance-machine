import { z } from 'zod';

export const createDeviceSchema = z.object({
  body: z.object({
    deviceId: z.string().min(1, 'deviceId is required'),
    name: z.string().min(1, 'name is required'),
    ipAddress: z.string().ip('Invalid IP address').optional(),
    location: z.string().optional(),
  }),
});

export const updateDeviceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'name is required').optional(),
    ipAddress: z.string().ip('Invalid IP address').optional(),
    location: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const deviceQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Page must be greater than 0').optional(),
    limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});
