const fs = require('fs');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({});
  console.log("No error synchronously");
} catch(e) {
  fs.writeFileSync('err.utf8.txt', e.stack || String(e), 'utf8');
}
