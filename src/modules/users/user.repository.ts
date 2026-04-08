import { prisma } from '../../utils/prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({ data });
  }

  async findMany() {
    return await prisma.user.findMany();
  }

  async findByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username }
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data
    });
  }

  async assignDevice(userId: string, systemDeviceId: string) {
    return await prisma.deviceUser.create({
      data: {
        userId,
        deviceId: systemDeviceId,
      },
    });
  }
}
