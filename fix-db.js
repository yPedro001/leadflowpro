const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDefaultId() {
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;
    await prisma.$executeRaw`ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;`;
    console.log("Successfully set DEFAULT gen_random_uuid()::text on profiles.id!");
  } catch (e) {
    console.error("Error executing SQL:", e);
  } finally {
    await prisma.$disconnect();
  }
}

fixDefaultId();
