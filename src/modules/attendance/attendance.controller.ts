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
    const { userId, startDate, endDate, deviceId, status, page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query as any;

    const where: any = {};
    if (userId) where.userId = String(userId);
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    // If deviceId is provided, filter users associated with that device
    if (deviceId) {
      const deviceUsers = await prisma.deviceUser.findMany({
        where: { deviceId: String(deviceId) },
        select: { userId: true },
      });
      const userIds = deviceUsers.map(du => du.userId);
      where.userId = { in: userIds };
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const totalRecords = await prisma.attendanceDaily.count({ where });
    const totalPages = Math.ceil(totalRecords / limit);
    const offset = (page - 1) * limit;

    const records = await prisma.attendanceDaily.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, deviceUserId: true, email: true } },
        sessions: { orderBy: { checkInTime: 'asc' } },
      },
      orderBy,
      skip: offset,
      take: limit,
    });

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAttendanceSessions = async (req: Request, res: Response) => {
  try {
    const { userId, startDate, endDate, deviceId, page = 1, limit = 10, sortBy = 'checkInTime', sortOrder = 'desc' } = req.query as any;

    const where: any = {};
    if (userId) where.userId = String(userId);
    if (startDate || endDate) {
      where.checkInTime = {};
      if (startDate) where.checkInTime.gte = new Date(String(startDate));
      if (endDate) where.checkInTime.lte = new Date(String(endDate));
    }

    // If deviceId is provided, filter via daily attendance or user
    if (deviceId) {
      const deviceUsers = await prisma.deviceUser.findMany({
        where: { deviceId: String(deviceId) },
        select: { userId: true },
      });
      const userIds = deviceUsers.map(du => du.userId);
      where.userId = { in: userIds };
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const totalRecords = await prisma.attendanceSession.count({ where });
    const totalPages = Math.ceil(totalRecords / limit);
    const offset = (page - 1) * limit;

    const records = await prisma.attendanceSession.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, deviceUserId: true, email: true } },
        daily: { select: { date: true, status: true } },
      },
      orderBy,
      skip: offset,
      take: limit,
    });

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as any;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.gte = new Date(String(startDate));
      if (endDate) dateFilter.date.lte = new Date(String(endDate));
    }

    const totalUsers = await prisma.user.count({ where: { isActive: true } });
    const totalSessions = await prisma.attendanceSession.count({
      where: dateFilter.date ? { checkInTime: dateFilter.date } : {},
    });
    const totalDailyRecords = await prisma.attendanceDaily.count({ where: dateFilter });

    const statusCounts = await prisma.attendanceDaily.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: { status: true },
    });

    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSessions,
        totalDailyRecords,
        statusSummary,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getUserCheckInOut = async (req: Request, res: Response) => {
  try {
    const { userId, startDate, endDate } = req.query as any;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: String(userId) }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const where: any = { userId: String(userId) };
    
    if (startDate || endDate) {
      where.checkInTime = {};
      if (startDate) where.checkInTime.gte = new Date(String(startDate));
      if (endDate) where.checkInTime.lte = new Date(String(endDate));
    }

    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: {
        daily: {
          select: { date: true, status: true }
        }
      },
      orderBy: { checkInTime: 'asc' },
    });

    // Helper function to format minutes to HH:MM:SS
    const formatDuration = (minutes: number | null) => {
      if (!minutes) return '00:00:00';
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      const secs = Math.floor((minutes * 60) % 60);
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    const summary = {
      totalSessions: sessions.length,
      totalCheckIns: sessions.filter(s => s.checkInTime).length,
      totalCheckOuts: sessions.filter(s => s.checkOutTime).length,
      totalHours: formatDuration(totalMinutes),
      averageDuration: sessions.length > 0 ? formatDuration(Math.round(totalMinutes / sessions.length)) : '00:00:00',
    };

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          deviceUserId: user.deviceUserId,
          email: user.email,
        },
        period: {
          startDate: startDate || 'N/A',
          endDate: endDate || 'N/A',
        },
        attendance: sessions.map(session => ({
          id: session.id,
          date: session.daily.date,
          checkInTime: session.checkInTime,
          checkOutTime: session.checkOutTime,
          durationMinutes: session.duration,
          durationFormatted: formatDuration(session.duration),
          status: session.daily.status,
        })),
        summary,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
