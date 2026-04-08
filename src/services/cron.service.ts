import cron from 'node-cron';
import { env } from '../config/env';
import { AttendanceService } from '../modules/attendance/attendance.service';
import { prisma } from '../utils/prisma';

const attendanceService = new AttendanceService();

export class CronService {
  private checkInJob: cron.ScheduledTask | null = null;
  private checkOutJob: cron.ScheduledTask | null = null;

  public start() {
    if (env.ENABLE_CRON !== 'true') {
      console.log('❌ Cron jobs are disabled');
      return;
    }

    this.scheduleCheckIn();
    this.scheduleCheckOut();
    console.log('✅ Cron jobs started successfully');
  }

  private scheduleCheckIn() {
    const [hours, minutes] = env.CHECK_IN_TIME.split(':');
    const cronExpression = `${minutes} ${hours} * * 1-5`; // Monday to Friday

    this.checkInJob = cron.schedule(
      cronExpression,
      async () => {
        await this.processCheckInForAllUsers();
      },
      {
        timezone: env.CRON_TIMEZONE,
      }
    );

    console.log(`⏰ Check-in cron scheduled: ${env.CHECK_IN_TIME} (${env.CRON_TIMEZONE})`);
  }

  private scheduleCheckOut() {
    const [hours, minutes] = env.CHECK_OUT_TIME.split(':');
    const cronExpression = `${minutes} ${hours} * * 1-5`; // Monday to Friday

    this.checkOutJob = cron.schedule(
      cronExpression,
      async () => {
        await this.processCheckOutForAllUsers();
      },
      {
        timezone: env.CRON_TIMEZONE,
      }
    );

    console.log(`⏰ Check-out cron scheduled: ${env.CHECK_OUT_TIME} (${env.CRON_TIMEZONE})`);
  }

  private async processCheckInForAllUsers() {
    try {
      console.log(`[CRON] Processing automatic check-in at ${new Date().toISOString()}`);

      // Get all active employees (role = EMPLOYEE)
      const users = await prisma.user.findMany({
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
          checkInTime.setHours(parseInt(env.CHECK_IN_TIME.split(':')[0]), parseInt(env.CHECK_IN_TIME.split(':')[1]), 0, 0);

          await attendanceService.processCheckIn(
            user.deviceUserId,
            'CRON_JOB', // System identifier
            checkInTime.toISOString(),
            {
              source: 'AUTOMATIC_CRON',
              timestamp: new Date().toISOString(),
            }
          );

          console.log(`✅ Check-in processed for user: ${user.name} (${user.deviceUserId})`);
        } catch (error) {
          console.error(`❌ Check-in failed for user ${user.name}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Cron check-in job error:', error);
    }
  }

  private async processCheckOutForAllUsers() {
    try {
      console.log(`[CRON] Processing automatic check-out at ${new Date().toISOString()}`);

      // Get all active employees
      const users = await prisma.user.findMany({
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
          checkOutTime.setHours(parseInt(env.CHECK_OUT_TIME.split(':')[0]), parseInt(env.CHECK_OUT_TIME.split(':')[1]), 0, 0);

          await attendanceService.processCheckOut(
            user.deviceUserId,
            'CRON_JOB', // System identifier
            checkOutTime.toISOString(),
            {
              source: 'AUTOMATIC_CRON',
              timestamp: new Date().toISOString(),
            }
          );

          console.log(`✅ Check-out processed for user: ${user.name} (${user.deviceUserId})`);
        } catch (error) {
          console.error(`❌ Check-out failed for user ${user.name}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Cron check-out job error:', error);
    }
  }

  public stop() {
    if (this.checkInJob) {
      this.checkInJob.stop();
    }
    if (this.checkOutJob) {
      this.checkOutJob.stop();
    }
    console.log('⏹️ Cron jobs stopped');
  }
}

export const cronService = new CronService();
