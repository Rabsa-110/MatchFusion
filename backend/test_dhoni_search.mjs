import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { getExpandedSearchTerms } from './lib/aliases.js';

dotenv.config();
const prisma = new PrismaClient();

async function testPlayerSearch(q) {
  const terms = getExpandedSearchTerms(q);
  const where = {
    OR: terms.flatMap((t) => [
      { name: { contains: t, mode: "insensitive" } },
      { country: { contains: t, mode: "insensitive" } },
      { position: { contains: t, mode: "insensitive" } },
      { role: { contains: t, mode: "insensitive" } },
      { team: { is: { name: { contains: t, mode: "insensitive" } } } },
    ])
  };
  const results = await prisma.player.findMany({ where, take: 5 });
  console.log(`"${q}" -> Found ${results.length}:`, results.map(r => `${r.name} (${r.sport}, ${r.country || 'No country'})`));
}

async function main() {
  await testPlayerSearch('ms dhoni');
  await testPlayerSearch('dhoni');
  await testPlayerSearch('thala');
  await testPlayerSearch('hardik');
  await testPlayerSearch('mahmudullah');
  await testPlayerSearch('litton');
  await testPlayerSearch('palmer');
  await testPlayerSearch('yamal');
  await testPlayerSearch('son');
  await prisma.$disconnect();
}

main().catch(console.error);

