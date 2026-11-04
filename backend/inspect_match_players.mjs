import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const matchCount = await prisma.match.count();
  console.log('Total matches in DB:', matchCount);

  const matches = await prisma.match.findMany({
    select: {
      id: true,
      sport: true,
      competition: true,
      homeTeam: true,
      awayTeam: true,
      eventsJson: true,
      statsJson: true,
      extraJson: true,
      scoreHome: true,
      scoreAway: true,
      statusDetail: true,
    }
  });

  const footballPlayers = new Set();
  const cricketPlayers = new Set();

  for (const m of matches) {
    if (m.eventsJson) {
      try {
        const events = JSON.parse(m.eventsJson);
        if (Array.isArray(events)) {
          for (const e of events) {
            if (e.player && e.player.trim().length >= 2) {
              if (m.sport === 'football') footballPlayers.add(`${e.player.trim()}|${e.team || m.homeTeam || ''}`);
              else cricketPlayers.add(`${e.player.trim()}|${e.team || m.homeTeam || ''}`);
            }
            if (e.assist && e.assist.trim().length >= 2) {
              footballPlayers.add(`${e.assist.trim()}|${e.team || m.homeTeam || ''}`);
            }
          }
        }
      } catch {}
    }
  }

  console.log(`Players found in match events: Football=${footballPlayers.size}, Cricket=${cricketPlayers.size}`);
  
  // Sample of cricket and football
  console.log('Sample football players from events:', Array.from(footballPlayers).slice(0, 10));
  console.log('Sample cricket players from events:', Array.from(cricketPlayers).slice(0, 10));

  await prisma.$disconnect();
}

main().catch(console.error);

