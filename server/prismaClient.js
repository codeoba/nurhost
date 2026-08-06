require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMySQL2 } = require('@prisma/adapter-mysql2');
const mysql2 = require('mysql2');

// Parse DATABASE_URL: mysql://user:pass@host:port/dbname
const dbUrl = process.env.DATABASE_URL || 'mysql://sql_nurhost_mdandu_com:b31b1b7540a87@127.0.0.1:3306/sql_nurhost_mdandu_com';

const pool = mysql2.createPool(dbUrl);
const adapter = new PrismaMySQL2(pool);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
