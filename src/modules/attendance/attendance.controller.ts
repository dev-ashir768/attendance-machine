import { Request, Response } from 'express';
import { AttendanceService } from './attendance.service';
import { prisma } from '../../utils/prisma';

const attendanceService = new AttendanceService();

export const checkIn = async (req: Request, res: Response) => {
  try {
    const { deviceUserId, timestamp, deviceId } = req.body;
    const result = await attendanceService.processCheckIn(deviceUserId, deviceId, timestamp, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  try {
    const { deviceUserId, timestamp, deviceId } = req.body;
    const result = await attendanceService.processCheckOut(deviceUserId, deviceId, timestamp, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAttendanceHistory = async (req: Request, res: Response) => {
  try {
    const { userId, startDate, endDate } = req.query as any;

    const where: any = {};
    if (userId) where.userId = String(userId);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    const records = await prisma.attendanceDaily.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, deviceUserId: true } },
        sessions: { orderBy: { checkInTime: 'asc' } },
      },
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
