import { AttendanceRepository } from './attendance.repository';
import { prisma } from '../../utils/prisma';
import { LogType } from '@prisma/client';

const DUPLICATE_THRESHOLD_MINUTES = 5;

export class AttendanceService {
  private repo = new AttendanceRepository();

  public async processCheckIn(deviceUserId: string, deviceId: string, timestampStr: string, rawPayload: any) {
    const timestamp = new Date(timestampStr);

    // Save Raw Log
    await this.repo.saveLog({
      deviceUserId,
      deviceId,
      timestamp,
      type: LogType.CHECK_IN,
      processed: false,
      rawPayload,
    });

    // Extract PST Date string (assume server timezone or handle UTC)
    // To handle Pakistan Standard Time consistently, extract YYYY-MM-DD in UTC+5
    const dateStr = this.formatDatePST(timestamp);

    const user = await prisma.user.findUnique({ where: { deviceUserId } });
    if (!user) {
      throw new Error(`DeviceUser ${deviceUserId} not mapped to any system user.`);
    }

    let daily: any = await this.repo.getAttendanceDaily(user.id, dateStr);
    if (!daily) {
      daily = await this.repo.createAttendanceDaily(user.id, dateStr);
      daily.sessions = [];
    }

    const latestSession = await this.repo.getLatestSession(daily.id);

    // Prevent duplicate check-in if within threshold
    if (latestSession) {
      const diffMinutes = (timestamp.getTime() - latestSession.checkInTime.getTime()) / 60000;
      // If no checkout and within threshold, ignore duplicate
      if (diffMinutes < DUPLICATE_THRESHOLD_MINUTES) {
        return { success: true, message: 'Duplicate check-in ignored' };
      }
      // If user forgot to checkout previous session, maybe auto-close it?
      // Simple approach: Just open a new session.
    }

    await this.repo.createSession(user.id, daily.id, timestamp);
    return { success: true, message: 'Check-in processed successfully' };
  }

  public async processCheckOut(deviceUserId: string, deviceId: string, timestampStr: string, rawPayload: any) {
    const timestamp = new Date(timestampStr);

    await this.repo.saveLog({
      deviceUserId,
      deviceId,
      timestamp,
      type: LogType.CHECK_OUT,
      processed: false,
      rawPayload,
    });

    const dateStr = this.formatDatePST(timestamp);

    const user = await prisma.user.findUnique({ where: { deviceUserId } });
    if (!user) {
      throw new Error(`DeviceUser ${deviceUserId} not mapped to any system user.`);
    }

    const daily = await this.repo.getAttendanceDaily(user.id, dateStr);
    if (!daily) {
      throw new Error('No check-in record found for today.');
    }

    const latestSession = await this.repo.getLatestSession(daily.id);
    if (!latestSession || latestSession.checkOutTime) {
      throw new Error('Multiple check-outs or no active check-in session found.');
    }

    const diffMinutes = (timestamp.getTime() - latestSession.checkInTime.getTime()) / 60000;
    
    // Check if it's too quick (duplicate card scan bouncing check-out immediately?)
    if (diffMinutes < 1) {
       return { success: true, message: 'Check-out ignored (debounce)' };
    }

    await this.repo.updateSessionCheckOut(latestSession.id, timestamp, Math.floor(diffMinutes));
    return { success: true, message: 'Check-out processed successfully' };
  }

  private formatDatePST(date: Date): string {
    // Converts a Date to YYYY-MM-DD strictly applying UTC+5 (Pakistan Standard Time)
    const pstDate = new Date(date.getTime() + 5 * 60 * 60 * 1000);
    return pstDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
  }
}
