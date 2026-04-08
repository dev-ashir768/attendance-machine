import 'dotenv/config';
import { AttendanceService } from '../modules/attendance/attendance.service';
import { prisma } from '../utils/prisma';

const ZKLib = require('node-zklib');

const K60_IP = process.env.K60_IP;
const K60_PORT = Number(process.env.K60_PORT ?? 4370);
const K60_DEVICE_ID = process.env.K60_DEVICE_ID ?? process.env.K60_IP ?? 'K60_DEVICE';
const K60_DEVICE_NAME = process.env.K60_DEVICE_NAME ?? 'K60 K60';
const K60_POLL_INTERVAL_MS = Number(process.env.K60_POLL_INTERVAL_MS ?? 60_000);
const K60_CHECKOUT_STATUSES = (process.env.K60_CHECKOUT_STATUSES ?? '1').split(',').map((value) => value.trim());
const K60_CHECKIN_STATUSES = (process.env.K60_CHECKIN_STATUSES ?? '0,4,8').split(',').map((value) => value.trim());

const attendanceService = new AttendanceService();

if (!K60_IP) {
  console.error('Missing required env: K60_IP');
  process.exit(1);
}

async function ensureDevice() {
  return prisma.device.upsert({
    where: { deviceId: K60_DEVICE_ID },
    update: { ipAddress: K60_IP, name: K60_DEVICE_NAME, isActive: true },
    create: { deviceId: K60_DEVICE_ID, name: K60_DEVICE_NAME, ipAddress: K60_IP, isActive: true },
  });
}

function isCheckOut(status: unknown) {
  if (status === undefined || status === null) {
    return false;
  }
  const value = String(status).trim();
  return K60_CHECKOUT_STATUSES.includes(value);
}

function normalizeAttendanceLog(log: any) {
  const deviceUserId = String(log.userid ?? log.userId ?? log.enrollNumber ?? log.id ?? '').trim();
  const timestamp = String(log.timestamp ?? log.time ?? log.date ?? '').trim();
  const status = log.status ?? log.checkType ?? log.state ?? log.punchType;
  return { deviceUserId, timestamp, status, rawPayload: log };
}

async function attendanceExists(deviceUserId: string, timestamp: string) {
  return prisma.attendanceLog.findFirst({
    where: {
      deviceUserId,
      deviceId: K60_DEVICE_ID,
      timestamp: new Date(timestamp),
    },
  });
}

async function processLog(log: any) {
  const normalized = normalizeAttendanceLog(log);
  if (!normalized.deviceUserId || !normalized.timestamp) {
    console.warn('Skipping invalid attendance log:', log);
    return;
  }

  const parsedTimestamp = new Date(normalized.timestamp.replace(' ', 'T'));
  if (Number.isNaN(parsedTimestamp.getTime())) {
    console.warn('Skipping attendance log with invalid timestamp:', normalized.timestamp);
    return;
  }

  const exists = await attendanceExists(normalized.deviceUserId, parsedTimestamp.toISOString());
  if (exists) {
    return;
  }

  if (isCheckOut(normalized.status)) {
    await attendanceService.processCheckOut(normalized.deviceUserId, K60_DEVICE_ID, parsedTimestamp.toISOString(), normalized.rawPayload);
    console.log(`Processed CHECK-OUT for user ${normalized.deviceUserId} at ${parsedTimestamp.toISOString()}`);
    return;
  }

  await attendanceService.processCheckIn(normalized.deviceUserId, K60_DEVICE_ID, parsedTimestamp.toISOString(), normalized.rawPayload);
  console.log(`Processed CHECK-IN for user ${normalized.deviceUserId} at ${parsedTimestamp.toISOString()}`);
}

async function pollOnce() {
  const zkInstance = new ZKLib(K60_IP, K60_PORT, 10000, 4000);
  try {
    await zkInstance.createSocket();
    const logs = await zkInstance.getAttendances();
    if (!Array.isArray(logs)) {
      console.warn('Received unexpected attendances response from K60:', logs);
      return;
    }

    for (const log of logs) {
      try {
        await processLog(log);
      } catch (error: any) {
        console.error('Error processing log:', error.message || error);
      }
    }
  } catch (error: any) {
    console.error('K60 poll error:', error.message || error);
  } finally {
    try {
      await zkInstance.disconnect();
    } catch (disconnectError) {
      // ignore disconnect errors
    }
  }
}

async function startPoller() {
  await ensureDevice();
  console.log(`Starting K60 poller for device ${K60_DEVICE_ID} at ${K60_IP}:${K60_PORT}`);
  await pollOnce();
  setInterval(async () => {
    console.log('Polling K60 for new attendances...');
    await pollOnce();
  }, K60_POLL_INTERVAL_MS);
}

startPoller().catch((error) => {
  console.error('K60 poller failed to start:', error.message || error);
  process.exit(1);
});
