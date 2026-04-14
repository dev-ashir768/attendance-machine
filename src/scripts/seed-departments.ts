import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const departments = [
    'Tiktok Shop',
    'Ebay',
    'SEO',
    'Marketing'
  ];

  console.log('Seeding departments...');

  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  console.log('Departments seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
