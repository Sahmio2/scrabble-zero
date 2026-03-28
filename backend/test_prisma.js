const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Prisma Client instantiated");
  await prisma.$connect();
  console.log("Prisma Client connected");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Prisma Error Message:", err.message);
  console.error("Prisma Error Stack:", err.stack);
});
