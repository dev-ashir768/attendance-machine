"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceRepository = void 0;
const prisma_1 = require("../../utils/prisma");
const client_1 = require("@prisma/client");
class AttendanceRepository {
    async saveLog(data) {
        return await prisma_1.prisma.attendanceLog.create({
            data: {
                deviceUserId: data.deviceUserId,
                deviceId: data.deviceId,
                timestamp: data.timestamp,
                type: data.type,
                processed: data.processed,
                rawPayload: data.rawPayload,
            },
        });
    }
    async getAttendanceDaily(userId, dateStr) {
        const date = new Date(dateStr);
        return await prisma_1.prisma.attendanceDaily.findUnique({
            where: {
                userId_date: {
                    userId: userId,
                    date: date,
                },
            },
            include: { sessions: true },
        });
    }
    async createAttendanceDaily(userId, dateStr) {
        const date = new Date(dateStr);
        return await prisma_1.prisma.attendanceDaily.create({
            data: {
                userId,
                date,
                status: client_1.AttendanceStatus.PRESENT,
            },
        });
    }
    async getLatestSession(dailyId) {
        return await prisma_1.prisma.attendanceSession.findFirst({
            where: { dailyId },
            orderBy: { checkInTime: 'desc' },
        });
    }
    async createSession(userId, dailyId, checkInTime) {
        return await prisma_1.prisma.attendanceSession.create({
            data: {
                userId,
                dailyId,
                checkInTime,
            },
        });
    }
    async updateSessionCheckOut(sessionId, checkOutTime, durationStr) {
        return await prisma_1.prisma.attendanceSession.update({
            where: { id: sessionId },
            data: { checkOutTime, duration: durationStr },
        });
    }
}
exports.AttendanceRepository = AttendanceRepository;
