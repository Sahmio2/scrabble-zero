import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
process.env.DATABASE_URL = databaseUrl;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
