"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRepository = void 0;
const prisma_1 = require("../../utils/prisma");
class DeviceRepository {
    async create(data) {
        return await prisma_1.prisma.device.create({ data });
    }
    async findMany(skip = 0, take = 10, isActive) {
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        return await prisma_1.prisma.device.findMany({
            where,
            include: {
                users: {
                    include: {
                        user: {
                            select: { id: true, name: true, deviceUserId: true, email: true }
                        }
                    }
                },
                _count: {
                    select: { logs: true }
                }
            },
            skip,
            take,
        });
    }
    async findById(id) {
        return await prisma_1.prisma.device.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        user: {
                            select: { id: true, name: true, deviceUserId: true, email: true }
                        }
                    }
                },
                logs: {
                    orderBy: { timestamp: 'desc' },
                    take: 10
                }
            },
        });
    }
    async findByDeviceId(deviceId) {
        return await prisma_1.prisma.device.findUnique({
            where: { deviceId },
            include: {
                users: true,
                logs: true
            }
        });
    }
    async update(id, data) {
        return await prisma_1.prisma.device.update({
            where: { id },
            data,
            include: {
                users: true,
            }
        });
    }
    async delete(id) {
        return await prisma_1.prisma.device.delete({
            where: { id }
        });
    }
    async countTotal() {
        return await prisma_1.prisma.device.count();
    }
    async countActive() {
        return await prisma_1.prisma.device.count({ where: { isActive: true } });
    }
}
exports.DeviceRepository = DeviceRepository;
