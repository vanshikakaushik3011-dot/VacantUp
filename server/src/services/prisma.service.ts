import { PrismaClient } from '@prisma/client';
import { inMemStore } from './store.service';

export const prisma = new PrismaClient();

let isPrismaConnected = false;

// Attempt initial check
prisma.$connect()
  .then(() => {
    isPrismaConnected = true;
    console.log('[VacantUp DB] Connected to PostgreSQL via Prisma');
  })
  .catch((err) => {
    isPrismaConnected = false;
    console.log('[VacantUp DB] PostgreSQL not currently connected. Operating in high-performance memory store fallback mode:', err.message);
  });

export function getIsPrismaConnected(): boolean {
  return isPrismaConnected;
}

export { inMemStore };
