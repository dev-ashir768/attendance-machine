import { z } from 'zod';

export const webhookPayloadSchema = z.object({
  body: z.object({
    deviceUserId: z.string().min(1, 'deviceUserId is required'),
    timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    deviceId: z.string().min(1, 'deviceId is required'),
  }),
});

export const reportQuerySchema = z.object({
  query: z.object({
    date: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    userId: z.string().optional(),
  }),
});
