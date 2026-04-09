import 'dotenv/config';
import { AttendanceService } from '../modules/attendance/attendance.service';
import { prisma } from '../utils/prisma';

const ZKLib = require('node-zklib');

const K60_IP = process.env.K60_IP;
const K60_PORT = Number(process.env.K60_PORT ?? 4370);
const K60_DEVICE_ID = process.env.K60_DEVICE_ID ?? process.env.K60_IP ?? 'K60_DEVICE';
const K60_DEVICE_NAME = process.env.K60_DEVICE_NAME ?? 'K60 K60';
const K60_POLL_INTERVAL_MS = Number(process.env.K60_POLL_INTERVAL_MS ?? 60_000);
const K60_CHECKOUT_STATUSES = (process.env.K60_CHECKOUT_STATUSES ?? '1,5,6').split(',').map((value) => value.trim());
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

function isCheckIn(status: unknown) {
  if (status === undefined || status === null) {
    return false;
  }
  const value = String(status).trim();
  return K60_CHECKIN_STATUSES.includes(value);
}

function normalizeAttendanceLog(log: any) {
  const deviceUserId = String(
    log.deviceUserId ?? log.userSn ?? log.userid ?? log.userId ?? log.enrollNumber ?? log.id ?? ''
  ).trim();
  const timestamp = String(
    log.recordTime ?? log.timestamp ?? log.time ?? log.date ?? ''
  ).trim();
  const status = log.status ?? log.checkType ?? log.state ?? log.punchType ?? log.type;
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

  const parsedTimestamp = new Date(normalized.timestamp);
  if (Number.isNaN(parsedTimestamp.getTime())) {
    console.warn('Skipping attendance log with invalid timestamp:', normalized.timestamp, 'raw log:', log);
    return;
  }

  const exists = await attendanceExists(normalized.deviceUserId, parsedTimestamp.toISOString());
  if (exists) {
    return;
  }

  // Debug logging
  console.log(`[DEBUG] User: ${normalized.deviceUserId}, Status: ${normalized.status}, Timestamp: ${parsedTimestamp.toISOString()}`);
  console.log(`[DEBUG] Checkout Statuses: ${K60_CHECKOUT_STATUSES.join(',')}`);
  console.log(`[DEBUG] Checkin Statuses: ${K60_CHECKIN_STATUSES.join(',')}`);
  console.log(`[DEBUG] Is Checkout? ${isCheckOut(normalized.status)}`);
  console.log(`[DEBUG] Is Checkin? ${isCheckIn(normalized.status)}`);
  if (normalized.status === undefined || normalized.status === null) {
    console.log('[DEBUG] Raw log fields:', Object.keys(normalized.rawPayload));
    console.log('[DEBUG] Raw log payload:', JSON.stringify(normalized.rawPayload));
  }

  if (isCheckOut(normalized.status)) {
    try {
      await attendanceService.processCheckOut(normalized.deviceUserId, K60_DEVICE_ID, parsedTimestamp.toISOString(), normalized.rawPayload);
      console.log(`✅ Processed CHECK-OUT for user ${normalized.deviceUserId} at ${parsedTimestamp.toISOString()}`);
    } catch (error: any) {
      console.error(`❌ CHECK-OUT ERROR for user ${normalized.deviceUserId}: ${error.message}`);
    }
    return;
  }

  if (!isCheckIn(normalized.status)) {
    // Fallback: if status is unknown but there is an open session, treat it as checkout.
    const user = await prisma.user.findUnique({ where: { deviceUserId: normalized.deviceUserId } });
    if (user) {
      const today = new Date(parsedTimestamp);
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00:00.000Z`;
      const daily = await prisma.attendanceDaily.findUnique({
        where: {
          userId_date: { userId: user.id, date: new Date(dateStr) }
        }
      });
      if (daily) {
        const latestSession = await prisma.attendanceSession.findFirst({
          where: { dailyId: daily.id },
          orderBy: { checkInTime: 'desc' }
        });
        if (latestSession && !latestSession.checkOutTime && parsedTimestamp.getTime() > latestSession.checkInTime.getTime() + 60000) {
          console.log(`[DEBUG] Fallback using open session checkout for user ${normalized.deviceUserId}`);
          try {
            await attendanceService.processCheckOut(normalized.deviceUserId, K60_DEVICE_ID, parsedTimestamp.toISOString(), normalized.rawPayload);
            console.log(`✅ Processed fallback CHECK-OUT for user ${normalized.deviceUserId} at ${parsedTimestamp.toISOString()}`);
            return;
          } catch (error: any) {
            console.error(`❌ Fallback CHECK-OUT ERROR for user ${normalized.deviceUserId}: ${error.message}`);
          }
        }
      }
    }
  }

  try {
    await attendanceService.processCheckIn(normalized.deviceUserId, K60_DEVICE_ID, parsedTimestamp.toISOString(), normalized.rawPayload);
    console.log(`✅ Processed CHECK-IN for user ${normalized.deviceUserId} at ${parsedTimestamp.toISOString()}`);
  } catch (error: any) {
    console.error(`❌ CHECK-IN ERROR for user ${normalized.deviceUserId}: ${error.message}`);
  }
}

async function pollOnce() {
  console.log('[POLL] Starting poll for device', K60_DEVICE_ID);
  const zkInstance = new ZKLib(K60_IP, K60_PORT, 10000, 4000);
  try {
    console.log('[POLL] Creating socket to', K60_IP, ':', K60_PORT);
    await zkInstance.createSocket();
    console.log('[POLL] Socket created successfully');
    console.log('[POLL] Fetching attendances...');
    const logsRaw = await zkInstance.getAttendances();
    console.log('[DEBUG] Raw attendances response:', JSON.stringify(logsRaw, null, 2));
    console.log('[POLL] Attendances fetched, processing', Array.isArray(logsRaw) ? logsRaw.length : 'unknown', 'logs');
    if (!Array.isArray(logsRaw)) {
      console.log('[DEBUG] logsRaw is not an array:', typeof logsRaw, logsRaw);
    }
    const logs = Array.isArray(logsRaw) ? logsRaw : logsRaw?.data ?? [];
    if (!Array.isArray(logs)) {
      console.warn('Received unexpected attendances response from K60:', logsRaw);
      return;
    }

    for (const log of logs) {
      try {
        await processLog(log);
      } catch (error: any) {
        console.error('Error processing log:', error.message || error);
      }
    }
    console.log('[POLL] Poll completed successfully');
  } catch (error: any) {
    console.error('K60 poll error:', error.message || error);
  } finally {
    try {
      console.log('[POLL] Disconnecting...');
      await zkInstance.disconnect();
      console.log('[POLL] Disconnected');
    } catch (disconnectError) {
      // ignore disconnect errors
    }
  }
}

async function startPoller() {
  console.log('[START] Ensuring device in database...');
  await ensureDevice();
  console.log(`[START] Starting K60 poller for device ${K60_DEVICE_ID} at ${K60_IP}:${K60_PORT}`);
  console.log('[START] Running initial poll...');
  await pollOnce();
  console.log('[START] Setting up interval polling every', K60_POLL_INTERVAL_MS / 1000, 'seconds');
  setInterval(async () => {
    console.log('Polling K60 for new attendances...');
    await pollOnce();
  }, K60_POLL_INTERVAL_MS);
}

startPoller().catch((error) => {
  console.error('K60 poller failed to start:', error.message || error);
  process.exit(1);
});
