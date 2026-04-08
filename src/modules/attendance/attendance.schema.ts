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
    deviceId: z.string().optional(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']).optional(),
    page: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Page must be greater than 0').optional(),
    limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').optional(),
    sortBy: z.enum(['date', 'createdAt', 'checkInTime']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
