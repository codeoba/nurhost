const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient();
} catch (err) {
  console.warn('PrismaClient initialization warning:', err.message);
  prisma = null;
}

module.exports = prisma;
