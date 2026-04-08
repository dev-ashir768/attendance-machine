import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  API_KEY: z.string(),
  ENABLE_CRON: z.string().default('true'),
  CHECK_IN_TIME: z.string().default('09:00'), // Format: HH:mm (24-hour)
  CHECK_OUT_TIME: z.string().default('17:00'), // Format: HH:mm (24-hour)
  CRON_TIMEZONE: z.string().default('Asia/Karachi'), // Pakistan timezone
});

export const env = envSchema.parse(process.env);
