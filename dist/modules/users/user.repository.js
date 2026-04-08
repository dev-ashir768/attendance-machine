"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../../utils/prisma");
class UserRepository {
    async create(data) {
        return await prisma_1.prisma.user.create({ data });
    }
    async findMany() {
        return await prisma_1.prisma.user.findMany();
    }
    async findByUsername(username) {
        return await prisma_1.prisma.user.findUnique({
            where: { username }
        });
    }
    async assignDevice(userId, systemDeviceId) {
        return await prisma_1.prisma.deviceUser.create({
            data: {
                userId,
                deviceId: systemDeviceId,
            },
        });
    }
}
exports.UserRepository = UserRepository;
