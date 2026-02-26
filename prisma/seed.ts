import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.day.createMany({
    data: [
      { id: 1, name: 'monday' },
      { id: 2, name: 'tuesday' },
      { id: 3, name: 'wednesday' },
      { id: 4, name: 'thursday' },
      { id: 5, name: 'friday' },
      { id: 6, name: 'saturday' },
      { id: 7, name: 'sunday' },
    ],
    skipDuplicates: true,
  });

  console.log('Days seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
