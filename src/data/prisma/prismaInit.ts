import { PrismaClient } from '@prisma/client';
// import dotenv from 'dotenv';

// // dotenv.config();
// // console.log(dotenv.config())
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in .env');
}

class PrismaSingleton {
  private static instance: PrismaClient | null = null;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      PrismaSingleton.instance = new PrismaClient({
        datasources: { db: { url: databaseUrl as string } },
      });
    }
    return PrismaSingleton.instance;
  }
}

export default PrismaSingleton.getInstance();
