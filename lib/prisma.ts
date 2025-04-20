import { PrismaClient, Role } from '../src/generated/prisma';

export const prisma = new PrismaClient();
export { Role };
