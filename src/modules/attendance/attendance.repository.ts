import { prisma } from '../../utils/prisma';
import { LogType, AttendanceStatus } from '@prisma/client';

export class AttendanceRepository {
  async saveLog(data: { deviceUserId: string; deviceId: string; timestamp: Date; type: LogType; processed: boolean; rawPayload: any }) {
    return await prisma.attendanceLog.create({
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

  async getAttendanceDaily(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    return await prisma.attendanceDaily.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: date,
        },
      },
      include: { sessions: true },
    });
  }

  async createAttendanceDaily(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    return await prisma.attendanceDaily.create({
      data: {
        userId,
        date,
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  async getLatestSession(dailyId: string) {
    return await prisma.attendanceSession.findFirst({
      where: { dailyId },
      orderBy: { checkInTime: 'desc' },
    });
  }

  async createSession(userId: string, dailyId: string, checkInTime: Date) {
    return await prisma.attendanceSession.create({
      data: {
        userId,
        dailyId,
        checkInTime,
      },
    });
  }

  async updateSessionCheckOut(sessionId: string, checkOutTime: Date, durationStr?: number) {
    return await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: { checkOutTime, duration: durationStr },
    });
  }
}
