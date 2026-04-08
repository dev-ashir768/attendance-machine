"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../utils/prisma");
const router = (0, express_1.Router)();
/**
 * GET /api/v1/attendance/summary
 * Get attendance summary for today
 */
router.get('/summary', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        // Get all attendance sessions for today
        const sessions = await prisma_1.prisma.attendanceSession.findMany({
            where: {
                daily: {
                    date: today,
                },
            },
            include: {
                user: true,
                daily: true,
            },
            orderBy: { checkInTime: 'asc' },
        });
        // Get attendance logs from cron
        const cronLogs = await prisma_1.prisma.attendanceLog.findMany({
            where: {
                timestamp: {
                    gte: new Date(`${today}T00:00:00Z`),
                    lt: new Date(`${today}T23:59:59Z`),
                },
                rawPayload: {
                    path: ['source'],
                    equals: 'AUTOMATIC_CRON',
                },
            },
            orderBy: { timestamp: 'desc' },
        });
        const summary = {
            date: today,
            totalSessions: sessions.length,
            totalEmployees: new Set(sessions.map((s) => s.userId)).size,
            sessions: sessions.map((session) => ({
                userId: session.userId,
                userName: session.user.name,
                checkInTime: session.checkInTime,
                checkOutTime: session.checkOutTime,
                durationMinutes: session.durationMinutes,
            })),
            cronActivity: {
                totalRecords: cronLogs.length,
                checkIns: cronLogs.filter((log) => log.type === 'CHECK_IN').length,
                checkOuts: cronLogs.filter((log) => log.type === 'CHECK_OUT').length,
                lastExecution: cronLogs.length > 0
                    ? cronLogs[0].timestamp
                    : 'No cron execution yet',
            },
        };
        res.json(summary);
    }
    catch (error) {
        console.error('Error fetching attendance summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});
/**
 * GET /api/v1/attendance/cron-status
 * Check if cron jobs are running
 */
router.get('/cron-status', async (req, res) => {
    try {
        const cronLogs = await prisma_1.prisma.attendanceLog.findMany({
            where: {
                rawPayload: {
                    path: ['source'],
                    equals: 'AUTOMATIC_CRON',
                },
            },
            orderBy: { timestamp: 'desc' },
            take: 10,
        });
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = cronLogs.filter((log) => log.timestamp.toISOString().split('T')[0] === today);
        res.json({
            cronEnabled: process.env.ENABLE_CRON === 'true',
            checkInTime: process.env.CHECK_IN_TIME || '09:00',
            checkOutTime: process.env.CHECK_OUT_TIME || '17:00',
            timezone: process.env.CRON_TIMEZONE || 'Asia/Karachi',
            totalCronExecutions: cronLogs.length,
            todayExecutions: todayLogs.length,
            lastCronRun: cronLogs.length > 0 ? cronLogs[0].timestamp : null,
            recentActivity: cronLogs.slice(0, 5).map((log) => ({
                type: log.type,
                timestamp: log.timestamp,
                deviceUserId: log.deviceUserId,
            })),
        });
    }
    catch (error) {
        console.error('Error fetching cron status:', error);
        res.status(500).json({ error: 'Failed to fetch cron status' });
    }
});
/**
 * GET /api/v1/attendance/logs
 * Get all attendance logs (cron and device)
 */
router.get('/logs', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const source = req.query.source; // 'cron' or 'device'
        let where = {};
        if (source === 'cron') {
            where.rawPayload = {
                path: ['source'],
                equals: 'AUTOMATIC_CRON',
            };
        }
        else if (source === 'device') {
            where.NOT = {
                rawPayload: {
                    path: ['source'],
                    equals: 'AUTOMATIC_CRON',
                },
            };
        }
        const logs = await prisma_1.prisma.attendanceLog.findMany({
            where,
            include: {
                user: true,
            },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
        res.json({
            total: logs.length,
            source: source || 'all',
            logs: logs.map((log) => ({
                id: log.id,
                type: log.type,
                timestamp: log.timestamp,
                userName: log.user?.name || 'Unknown',
                deviceId: log.deviceId,
                source: log.rawPayload?.source || 'device',
            })),
        });
    }
    catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});
exports.default = router;
