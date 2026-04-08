"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronService = exports.CronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const env_1 = require("../config/env");
const attendance_service_1 = require("../modules/attendance/attendance.service");
const prisma_1 = require("../utils/prisma");
const attendanceService = new attendance_service_1.AttendanceService();
class CronService {
    checkInJob = null;
    checkOutJob = null;
    start() {
        if (env_1.env.ENABLE_CRON !== 'true') {
            console.log('❌ Cron jobs are disabled');
            return;
        }
        this.scheduleCheckIn();
        this.scheduleCheckOut();
        console.log('✅ Cron jobs started successfully');
    }
    scheduleCheckIn() {
        const [hours, minutes] = env_1.env.CHECK_IN_TIME.split(':');
        const cronExpression = `${minutes} ${hours} * * 1-5`; // Monday to Friday
        this.checkInJob = node_cron_1.default.schedule(cronExpression, async () => {
            await this.processCheckInForAllUsers();
        }, {
            timezone: env_1.env.CRON_TIMEZONE,
        });
        console.log(`⏰ Check-in cron scheduled: ${env_1.env.CHECK_IN_TIME} (${env_1.env.CRON_TIMEZONE})`);
    }
    scheduleCheckOut() {
        const [hours, minutes] = env_1.env.CHECK_OUT_TIME.split(':');
        const cronExpression = `${minutes} ${hours} * * 1-5`; // Monday to Friday
        this.checkOutJob = node_cron_1.default.schedule(cronExpression, async () => {
            await this.processCheckOutForAllUsers();
        }, {
            timezone: env_1.env.CRON_TIMEZONE,
        });
        console.log(`⏰ Check-out cron scheduled: ${env_1.env.CHECK_OUT_TIME} (${env_1.env.CRON_TIMEZONE})`);
    }
    async processCheckInForAllUsers() {
        try {
            console.log(`[CRON] Processing automatic check-in at ${new Date().toISOString()}`);
            // Get all active employees (role = EMPLOYEE)
            const users = await prisma_1.prisma.user.findMany({
                where: { role: 'EMPLOYEE' },
            });
            if (users.length === 0) {
                console.log('[CRON] No employees found');
                return;
            }
            for (const user of users) {
                try {
                    // Create a synthetic check-in record
                    const today = new Date();
                    const checkInTime = new Date(today);
                    checkInTime.setHours(parseInt(env_1.env.CHECK_IN_TIME.split(':')[0]), parseInt(env_1.env.CHECK_IN_TIME.split(':')[1]), 0, 0);
                    await attendanceService.processCheckIn(user.deviceUserId, 'CRON_JOB', // System identifier
                    checkInTime.toISOString(), {
                        source: 'AUTOMATIC_CRON',
                        timestamp: new Date().toISOString(),
                    });
                    console.log(`✅ Check-in processed for user: ${user.name} (${user.deviceUserId})`);
                }
                catch (error) {
                    console.error(`❌ Check-in failed for user ${user.name}:`, error);
                }
            }
        }
        catch (error) {
            console.error('❌ Cron check-in job error:', error);
        }
    }
    async processCheckOutForAllUsers() {
        try {
            console.log(`[CRON] Processing automatic check-out at ${new Date().toISOString()}`);
            // Get all active employees
            const users = await prisma_1.prisma.user.findMany({
                where: { role: 'EMPLOYEE' },
            });
            if (users.length === 0) {
                console.log('[CRON] No employees found');
                return;
            }
            for (const user of users) {
                try {
                    // Create a synthetic check-out record
                    const today = new Date();
                    const checkOutTime = new Date(today);
                    checkOutTime.setHours(parseInt(env_1.env.CHECK_OUT_TIME.split(':')[0]), parseInt(env_1.env.CHECK_OUT_TIME.split(':')[1]), 0, 0);
                    await attendanceService.processCheckOut(user.deviceUserId, 'CRON_JOB', // System identifier
                    checkOutTime.toISOString(), {
                        source: 'AUTOMATIC_CRON',
                        timestamp: new Date().toISOString(),
                    });
                    console.log(`✅ Check-out processed for user: ${user.name} (${user.deviceUserId})`);
                }
                catch (error) {
                    console.error(`❌ Check-out failed for user ${user.name}:`, error);
                }
            }
        }
        catch (error) {
            console.error('❌ Cron check-out job error:', error);
        }
    }
    stop() {
        if (this.checkInJob) {
            this.checkInJob.stop();
        }
        if (this.checkOutJob) {
            this.checkOutJob.stop();
        }
        console.log('⏹️ Cron jobs stopped');
    }
}
exports.CronService = CronService;
exports.cronService = new CronService();
