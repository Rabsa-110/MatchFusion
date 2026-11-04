// Test the full players route query with team include
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

try {
  const [total, players] = await Promise.all([
    prisma.player.count({}),
    prisma.player.findMany({
      where: {},
      include: { team: { select: { id: true, name: true, logo: true, sport: true, country: true } } },
      orderBy: [{ name: 'asc' }],
      take: 3,
      skip: 0,
    }),
  ]);
  console.log('Total:', total);
  console.log('First 3 with teams:');
  players.forEach(p => console.log(`  - ${p.name} (${p.sport}) -> team: ${p.team?.name}, country: ${p.team?.country}`));
} catch (err) {
  console.error('Query error:', err.message);
  console.error(err.stack);
}

await prisma.$disconnect();

