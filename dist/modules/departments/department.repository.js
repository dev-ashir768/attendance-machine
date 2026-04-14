"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentRepository = void 0;
const prisma_1 = require("../../utils/prisma");
class DepartmentRepository {
    async findMany() {
        return await prisma_1.prisma.department.findMany({
            orderBy: { name: 'asc' }
        });
    }
    async findById(id) {
        return await prisma_1.prisma.department.findUnique({
            where: { id }
        });
    }
    async create(name) {
        return await prisma_1.prisma.department.create({
            data: { name }
        });
    }
    async delete(id) {
        return await prisma_1.prisma.department.delete({
            where: { id }
        });
    }
}
exports.DepartmentRepository = DepartmentRepository;
