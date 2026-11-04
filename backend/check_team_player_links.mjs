import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const teamsWithPlayers = await prisma.team.findMany({
    where: { players: { some: {} } },
    select: { id: true, name: true, sport: true, _count: { select: { players: true } } }
  });
  console.log(`Teams with players in DB: ${teamsWithPlayers.length}`);
  teamsWithPlayers.forEach(t => console.log(`  - ${t.name} (${t.sport}): ${t._count.players} players`));

  // Check players without teamId
  const unlinkedPlayers = await prisma.player.count({
    where: { teamId: null }
  });
  console.log(`Players with no team link: ${unlinkedPlayers}`);

  await prisma.$disconnect();
}

main().catch(console.error);

