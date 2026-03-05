import { PrismaClient } from './src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Prisma Client instantiated");
  // Try to connect
  await prisma.$connect();
  console.log("Prisma Client connected");
  await prisma.$disconnect();
}

main().catch(console.error);
