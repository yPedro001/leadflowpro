const { prisma } = require('./src/lib/prisma');
async function run() {
  try {
    const p = await prisma.profile.findFirst();
    console.log('Query success:', !!p);
  } catch (e) {
    console.error('Query error:', e);
  }
}
run();

export {};
