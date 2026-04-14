import { prisma } from '../../utils/prisma';

export class DepartmentRepository {
  async findMany() {
    return await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    return await prisma.department.findUnique({
      where: { id }
    });
  }

  async create(name: string) {
    return await prisma.department.create({
      data: { name }
    });
  }

  async delete(id: string) {
    return await prisma.department.delete({
      where: { id }
    });
  }
}
