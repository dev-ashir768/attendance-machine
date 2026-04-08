"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        // Check if admin user already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { username: 'admin' }
        });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }
        // Create admin user
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash('admin123', saltRounds);
        const adminUser = await prisma.user.create({
            data: {
                deviceUserId: 'ADMIN001',
                username: 'admin',
                password: hashedPassword,
                name: 'System Administrator',
                email: 'admin@company.com',
                role: 'ADMIN',
                isActive: true
            }
        });
        console.log('Admin user created successfully:', {
            id: adminUser.id,
            username: adminUser.username,
            name: adminUser.name,
            role: adminUser.role
        });
        console.log('Default login credentials:');
        console.log('Username: admin');
        console.log('Password: admin123');
    }
    catch (error) {
        console.error('Error seeding admin user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
