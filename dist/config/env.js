"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    DATABASE_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(),
    API_KEY: zod_1.z.string(),
    ENABLE_CRON: zod_1.z.string().default('true'),
    CHECK_IN_TIME: zod_1.z.string().default('09:00'), // Format: HH:mm (24-hour)
    CHECK_OUT_TIME: zod_1.z.string().default('17:00'), // Format: HH:mm (24-hour)
    CRON_TIMEZONE: zod_1.z.string().default('Asia/Karachi'), // Pakistan timezone
});
exports.env = envSchema.parse(process.env);
