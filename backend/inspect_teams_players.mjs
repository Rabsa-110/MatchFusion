import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const teams = await prisma.team.findMany({
    select: { id: true, name: true, sport: true, country: true, externalId: true },
    orderBy: { name: 'asc' }
  });

  console.log(`Total teams in DB: ${teams.length}`);
  const footballTeams = teams.filter(t => t.sport === 'football');
  const cricketTeams = teams.filter(t => t.sport === 'cricket');
  console.log(`Football teams: ${footballTeams.length}, Cricket teams: ${cricketTeams.length}`);

  console.log('Sample football teams:', footballTeams.slice(0, 15).map(t => t.name));
  console.log('Sample cricket teams:', cricketTeams.slice(0, 15).map(t => t.name));

  // Check players currently in DB
  const playerCount = await prisma.player.count();
  console.log(`Total players currently in DB: ${playerCount}`);

  // Check if Dhoni is in DB
  const dhoni = await prisma.player.findMany({
    where: { name: { contains: 'dhoni', mode: 'insensitive' } }
  });
  console.log('Dhoni found:', dhoni.length);

  await prisma.$disconnect();
}

main().catch(console.error);

