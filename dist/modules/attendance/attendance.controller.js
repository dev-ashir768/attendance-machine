"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceSessions = exports.getAttendanceHistory = exports.checkOut = exports.checkIn = void 0;
const attendance_service_1 = require("./attendance.service");
const prisma_1 = require("../../utils/prisma");
const attendanceService = new attendance_service_1.AttendanceService();
const checkIn = async (req, res) => {
    try {
        const { deviceUserId, timestamp, deviceId } = req.body;
        const result = await attendanceService.processCheckIn(deviceUserId, deviceId, timestamp, req.body);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.checkIn = checkIn;
const checkOut = async (req, res) => {
    try {
        const { deviceUserId, timestamp, deviceId } = req.body;
        const result = await attendanceService.processCheckOut(deviceUserId, deviceId, timestamp, req.body);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.checkOut = checkOut;
const getAttendanceHistory = async (req, res) => {
    try {
        const { userId, startDate, endDate, deviceId, status, page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;
        const where = {};
        if (userId)
            where.userId = String(userId);
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(String(startDate));
            if (endDate)
                where.date.lte = new Date(String(endDate));
        }
        // If deviceId is provided, filter users associated with that device
        if (deviceId) {
            const deviceUsers = await prisma_1.prisma.deviceUser.findMany({
                where: { deviceId: String(deviceId) },
                select: { userId: true },
            });
            const userIds = deviceUsers.map(du => du.userId);
            where.userId = { in: userIds };
        }
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const totalRecords = await prisma_1.prisma.attendanceDaily.count({ where });
        const totalPages = Math.ceil(totalRecords / limit);
        const offset = (page - 1) * limit;
        const records = await prisma_1.prisma.attendanceDaily.findMany({
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
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getAttendanceHistory = getAttendanceHistory;
const getAttendanceSessions = async (req, res) => {
    try {
        const { userId, startDate, endDate, deviceId, page = 1, limit = 10, sortBy = 'checkInTime', sortOrder = 'desc' } = req.query;
        const where = {};
        if (userId)
            where.userId = String(userId);
        if (startDate || endDate) {
            where.checkInTime = {};
            if (startDate)
                where.checkInTime.gte = new Date(String(startDate));
            if (endDate)
                where.checkInTime.lte = new Date(String(endDate));
        }
        // If deviceId is provided, filter via daily attendance or user
        if (deviceId) {
            const deviceUsers = await prisma_1.prisma.deviceUser.findMany({
                where: { deviceId: String(deviceId) },
                select: { userId: true },
            });
            const userIds = deviceUsers.map(du => du.userId);
            where.userId = { in: userIds };
        }
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const totalRecords = await prisma_1.prisma.attendanceSession.count({ where });
        const totalPages = Math.ceil(totalRecords / limit);
        const offset = (page - 1) * limit;
        const records = await prisma_1.prisma.attendanceSession.findMany({
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
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getAttendanceSessions = getAttendanceSessions;
