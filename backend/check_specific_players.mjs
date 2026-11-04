import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const allCount = await prisma.player.count();
  console.log('Total players in DB:', allCount);

  const ronaldo = await prisma.player.findMany({
    where: { name: { contains: 'ronaldo', mode: 'insensitive' } }
  });
  console.log('Ronaldo found:', ronaldo.length, ronaldo.map(r => r.name));

  const shakib = await prisma.player.findMany({
    where: { name: { contains: 'shakib', mode: 'insensitive' } }
  });
  console.log('Shakib found:', shakib.length, shakib.map(s => s.name));

  // List 10 random players in DB
  const sample = await prisma.player.findMany({ take: 10 });
  console.log('Sample 10 players:', sample.map(p => `${p.name} (${p.sport}, ${p.country || 'no country'})`));

  await prisma.$disconnect();
}

main().catch(console.error);
