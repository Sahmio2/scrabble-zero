const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});
async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("SUCCESS:", !!user);
  } catch(e) {
    require('fs').writeFileSync('prisma_error_output.txt', e.stack || e.message || String(e));
  } finally {
    await prisma.$disconnect();
  }
}
main();
