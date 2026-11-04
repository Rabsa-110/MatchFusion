// Debug players route query
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

try {
  // Test the exact query the route runs
  const where = {};
  const [total, players] = await Promise.all([
    prisma.player.count({ where }),
    prisma.player.findMany({
      where,
      include: { team: { select: { id: true, name: true, logo: true, sport: true, country: true } } },
      orderBy: [{ name: 'asc' }],
      take: 5,
      skip: 0,
    }),
  ]);
  console.log('Total:', total);
  console.log('First 5 names:', players.map(p => p.name));
} catch (err) {
  console.error('Query error:', err.message);
}

await prisma.$disconnect();

