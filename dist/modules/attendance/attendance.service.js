"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const attendance_repository_1 = require("./attendance.repository");
const prisma_1 = require("../../utils/prisma");
const client_1 = require("@prisma/client");
const DUPLICATE_THRESHOLD_MINUTES = 5;
class AttendanceService {
    repo = new attendance_repository_1.AttendanceRepository();
    async processCheckIn(deviceUserId, deviceId, timestampStr, rawPayload) {
        const timestamp = new Date(timestampStr);
        // Save Raw Log
        await this.repo.saveLog({
            deviceUserId,
            deviceId,
            timestamp,
            type: client_1.LogType.CHECK_IN,
            processed: false,
            rawPayload,
        });
        // Extract PST Date string (assume server timezone or handle UTC)
        // To handle Pakistan Standard Time consistently, extract YYYY-MM-DD in UTC+5
        const dateStr = this.formatDatePST(timestamp);
        const user = await this.ensureUser(deviceUserId);
        let daily = await this.repo.getAttendanceDaily(user.id, dateStr);
        if (!daily) {
            daily = await this.repo.createAttendanceDaily(user.id, dateStr);
            daily.sessions = [];
        }
        const latestSession = await this.repo.getLatestSession(daily.id);
        // If any session already exists for today, don't allow another check-in
        if (latestSession) {
            return { success: true, message: 'Check-in ignored: User already has a session today.' };
        }
        await this.repo.createSession(user.id, daily.id, timestamp);
        return { success: true, message: 'Check-in processed successfully' };
    }
    async processCheckOut(deviceUserId, deviceId, timestampStr, rawPayload) {
        const timestamp = new Date(timestampStr);
        await this.repo.saveLog({
            deviceUserId,
            deviceId,
            timestamp,
            type: client_1.LogType.CHECK_OUT,
            processed: false,
            rawPayload,
        });
        const dateStr = this.formatDatePST(timestamp);
        const user = await this.ensureUser(deviceUserId);
        const daily = await this.repo.getAttendanceDaily(user.id, dateStr);
        if (!daily) {
            throw new Error('No check-in record found for today.');
        }
        const latestSession = await this.repo.getLatestSession(daily.id);
        if (!latestSession) {
            return { success: true, message: 'Check-out ignored: No check-in session found for today.' };
        }
        if (latestSession.checkOutTime) {
            return { success: true, message: 'Check-out ignored: User already checked out today.' };
        }
        const diffMinutes = (timestamp.getTime() - latestSession.checkInTime.getTime()) / 60000;
        // Check if it's too quick (duplicate card scan bouncing check-out immediately?)
        if (diffMinutes < 1) {
            return { success: true, message: 'Check-out ignored (debounce)' };
        }
        await this.repo.updateSessionCheckOut(latestSession.id, timestamp, Math.floor(diffMinutes));
        return { success: true, message: 'Check-out processed successfully' };
    }
    async ensureUser(deviceUserId) {
        let user = await prisma_1.prisma.user.findUnique({ where: { deviceUserId } });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    deviceUserId,
                    name: `DeviceUser ${deviceUserId}`,
                    role: 'EMPLOYEE',
                },
            });
        }
        return user;
    }
    formatDatePST(date) {
        // Converts a Date to YYYY-MM-DD strictly applying UTC+5 (Pakistan Standard Time)
        const pstDate = new Date(date.getTime() + 5 * 60 * 60 * 1000);
        return pstDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
    }
}
exports.AttendanceService = AttendanceService;
