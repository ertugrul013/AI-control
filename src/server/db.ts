import { PrismaClient } from '@prisma/client';

// One client per process; in development the module is reloaded, so it is kept on globalThis.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
