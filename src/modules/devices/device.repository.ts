import { prisma } from '../../utils/prisma';
import { Prisma } from '@prisma/client';

export class DeviceRepository {
  async create(data: Prisma.DeviceCreateInput) {
    return await prisma.device.create({ data });
  }

  async findMany(skip: number = 0, take: number = 10, isActive?: boolean) {
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await prisma.device.findMany({
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

  async findById(id: string) {
    return await prisma.device.findUnique({
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

  async findByDeviceId(deviceId: string) {
    return await prisma.device.findUnique({
      where: { deviceId },
      include: {
        users: true,
        logs: true
      }
    });
  }

  async update(id: string, data: Prisma.DeviceUpdateInput) {
    return await prisma.device.update({
      where: { id },
      data,
      include: {
        users: true,
      }
    });
  }

  async delete(id: string) {
    return await prisma.device.delete({
      where: { id }
    });
  }

  async countTotal() {
    return await prisma.device.count();
  }

  async countActive() {
    return await prisma.device.count({ where: { isActive: true } });
  }
}
