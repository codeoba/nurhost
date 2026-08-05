import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? 'mysql://sql_nurhost_mdandu_com:b31b1b7540a87@127.0.0.1:3306/sql_nurhost_mdandu_com',
  },
});
