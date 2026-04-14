import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.department.count();
  const depts = await prisma.department.findMany();
  console.log(`Found ${count} departments.`);
  console.log(depts);
}
main().finally(() => prisma.$disconnect());
