import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { getExpandedSearchTerms } from './lib/aliases.js';

dotenv.config();
const prisma = new PrismaClient();

async function testSearch(query) {
  const terms = getExpandedSearchTerms(query);
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
  console.log(`Query: "${query}" -> Found ${results.length}:`, results.map(r => `${r.name} (${r.sport}, ${r.country})`));
}

async function main() {
  await testSearch('cristiano ronaldo');
  await testSearch('cr7');
  await testSearch('shakib al ha');
  await testSearch('shakib');
  await testSearch('messi');
  await testSearch('kohli');
  await prisma.$disconnect();
}

main().catch(console.error);
