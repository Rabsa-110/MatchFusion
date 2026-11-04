import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const REAL_PLAYERS = [
  // ── Cricket International Superstars ──
  {
    name: "Shakib Al Hasan",
    shortName: "S. Al Hasan",
    country: "Bangladesh",
    sport: "cricket",
    position: "All-rounder",
    role: "Left-hand bat · Slow left-arm orthodox",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170912/shakib-al-hasan.jpg",
    provider: "cricket",
    externalId: "shakib-al-hasan-bd",
    stats: { runs: 14450, wickets: 690, appearances: 440 }
  },
  {
    name: "Tamim Iqbal",
    shortName: "T. Iqbal",
    country: "Bangladesh",
    sport: "cricket",
    position: "Opening Batter",
    role: "Left-hand bat",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170910/tamim-iqbal.jpg",
    provider: "cricket",
    externalId: "tamim-iqbal-bd",
    stats: { runs: 15190, wickets: 1, appearances: 387 }
  },
  {
    name: "Mushfiqur Rahim",
    shortName: "M. Rahim",
    country: "Bangladesh",
    sport: "cricket",
    position: "Wicketkeeper Batter",
    role: "Right-hand bat · Wicketkeeper",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170914/mushfiqur-rahim.jpg",
    provider: "cricket",
    externalId: "mushfiqur-rahim-bd",
    stats: { runs: 14700, wickets: 0, appearances: 450 }
  },
  {
    name: "Mustafizur Rahman",
    shortName: "M. Rahman",
    country: "Bangladesh",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Left-arm fast-medium",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170925/mustafizur-rahman.jpg",
    provider: "cricket",
    externalId: "mustafizur-rahman-bd",
    stats: { runs: 320, wickets: 320, appearances: 220 }
  },
  {
    name: "Virat Kohli",
    shortName: "V. Kohli",
    country: "India",
    sport: "cricket",
    position: "Top-order Batter",
    role: "Right-hand bat",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170661/virat-kohli.jpg",
    provider: "cricket",
    externalId: "virat-kohli-ind",
    stats: { runs: 26900, wickets: 9, appearances: 530 }
  },
  {
    name: "Rohit Sharma",
    shortName: "R. Sharma",
    country: "India",
    sport: "cricket",
    position: "Opening Batter",
    role: "Right-hand bat",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170658/rohit-sharma.jpg",
    provider: "cricket",
    externalId: "rohit-sharma-ind",
    stats: { runs: 19100, wickets: 15, appearances: 480 }
  },
  {
    name: "Jasprit Bumrah",
    shortName: "J. Bumrah",
    country: "India",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Right-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170685/jasprit-bumrah.jpg",
    provider: "cricket",
    externalId: "jasprit-bumrah-ind",
    stats: { runs: 290, wickets: 395, appearances: 190 }
  },
  {
    name: "Babar Azam",
    shortName: "B. Azam",
    country: "Pakistan",
    sport: "cricket",
    position: "Top-order Batter",
    role: "Right-hand bat",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170759/babar-azam.jpg",
    provider: "cricket",
    externalId: "babar-azam-pak",
    stats: { runs: 13500, wickets: 0, appearances: 280 }
  },
  {
    name: "Shaheen Shah Afridi",
    shortName: "S. Afridi",
    country: "Pakistan",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Left-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170776/shaheen-afridi.jpg",
    provider: "cricket",
    externalId: "shaheen-afridi-pak",
    stats: { runs: 510, wickets: 310, appearances: 160 }
  },
  {
    name: "Pat Cummins",
    shortName: "P. Cummins",
    country: "Australia",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Right-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170642/pat-cummins.jpg",
    provider: "cricket",
    externalId: "pat-cummins-aus",
    stats: { runs: 1800, wickets: 480, appearances: 215 }
  },
  {
    name: "Rashid Khan",
    shortName: "R. Khan",
    country: "Afghanistan",
    sport: "cricket",
    position: "Bowling All-rounder",
    role: "Right-arm legbreak",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170884/rashid-khan.jpg",
    provider: "cricket",
    externalId: "rashid-khan-afg",
    stats: { runs: 2100, wickets: 360, appearances: 195 }
  },
  {
    name: "Joe Root",
    shortName: "J. Root",
    country: "England",
    sport: "cricket",
    position: "Top-order Batter",
    role: "Right-hand bat · Off-break",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170617/joe-root.jpg",
    provider: "cricket",
    externalId: "joe-root-eng",
    stats: { runs: 19800, wickets: 75, appearances: 350 }
  },
  {
    name: "Kane Williamson",
    shortName: "K. Williamson",
    country: "New Zealand",
    sport: "cricket",
    position: "Top-order Batter",
    role: "Right-hand bat",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170733/kane-williamson.jpg",
    provider: "cricket",
    externalId: "kane-williamson-nz",
    stats: { runs: 18200, wickets: 30, appearances: 360 }
  },

  // ── Football International Icons ──
  {
    name: "Cristiano Ronaldo",
    shortName: "C. Ronaldo",
    country: "Portugal",
    sport: "football",
    position: "Forward",
    role: "Centre-Forward / Left Winger",
    image: "https://media.api-sports.io/football/players/874.png",
    provider: "football",
    externalId: "874",
    stats: { goals: 895, assists: 252, appearances: 1220 }
  },
  {
    name: "Lionel Messi",
    shortName: "L. Messi",
    country: "Argentina",
    sport: "football",
    position: "Forward",
    role: "Right Winger / Attacking Midfielder",
    image: "https://media.api-sports.io/football/players/154.png",
    provider: "football",
    externalId: "154",
    stats: { goals: 838, assists: 374, appearances: 1070 }
  },
  {
    name: "Kylian Mbappé",
    shortName: "K. Mbappé",
    country: "France",
    sport: "football",
    position: "Forward",
    role: "Centre-Forward / Left Winger",
    image: "https://media.api-sports.io/football/players/278.png",
    provider: "football",
    externalId: "278",
    stats: { goals: 310, assists: 130, appearances: 410 }
  },
  {
    name: "Erling Haaland",
    shortName: "E. Haaland",
    country: "Norway",
    sport: "football",
    position: "Forward",
    role: "Centre-Forward",
    image: "https://media.api-sports.io/football/players/1100.png",
    provider: "football",
    externalId: "1100",
    stats: { goals: 260, assists: 50, appearances: 305 }
  },
  {
    name: "Neymar Jr",
    shortName: "Neymar",
    country: "Brazil",
    sport: "football",
    position: "Forward",
    role: "Left Winger / Attacking Midfielder",
    image: "https://media.api-sports.io/football/players/276.png",
    provider: "football",
    externalId: "276",
    stats: { goals: 360, assists: 220, appearances: 590 }
  },
  {
    name: "Jude Bellingham",
    shortName: "J. Bellingham",
    country: "England",
    sport: "football",
    position: "Midfielder",
    role: "Central / Attacking Midfielder",
    image: "https://media.api-sports.io/football/players/152982.png",
    provider: "football",
    externalId: "152982",
    stats: { goals: 65, assists: 42, appearances: 240 }
  },
  {
    name: "Vinícius Júnior",
    shortName: "Vini Jr",
    country: "Brazil",
    sport: "football",
    position: "Forward",
    role: "Left Winger",
    image: "https://media.api-sports.io/football/players/762.png",
    provider: "football",
    externalId: "762",
    stats: { goals: 95, assists: 78, appearances: 285 }
  },
  {
    name: "Kevin De Bruyne",
    shortName: "K. De Bruyne",
    country: "Belgium",
    sport: "football",
    position: "Midfielder",
    role: "Attacking Midfielder",
    image: "https://media.api-sports.io/football/players/629.png",
    provider: "football",
    externalId: "629",
    stats: { goals: 145, assists: 250, appearances: 610 }
  },
  {
    name: "Mohamed Salah",
    shortName: "M. Salah",
    country: "Egypt",
    sport: "football",
    position: "Forward",
    role: "Right Winger",
    image: "https://media.api-sports.io/football/players/306.png",
    provider: "football",
    externalId: "306",
    stats: { goals: 315, assists: 140, appearances: 580 }
  },
  {
    name: "Robert Lewandowski",
    shortName: "R. Lewandowski",
    country: "Poland",
    sport: "football",
    position: "Forward",
    role: "Centre-Forward",
    image: "https://media.api-sports.io/football/players/521.png",
    provider: "football",
    externalId: "521",
    stats: { goals: 620, assists: 150, appearances: 850 }
  },
  {
    name: "Luka Modrić",
    shortName: "L. Modrić",
    country: "Croatia",
    sport: "football",
    position: "Midfielder",
    role: "Central Midfielder",
    image: "https://media.api-sports.io/football/players/754.png",
    provider: "football",
    externalId: "754",
    stats: { goals: 88, assists: 135, appearances: 870 }
  },
  {
    name: "Harry Kane",
    shortName: "H. Kane",
    country: "England",
    sport: "football",
    position: "Forward",
    role: "Centre-Forward",
    image: "https://media.api-sports.io/football/players/184.png",
    provider: "football",
    externalId: "184",
    stats: { goals: 390, assists: 95, appearances: 560 }
  },
  {
    name: "Bukayo Saka",
    shortName: "B. Saka",
    country: "England",
    sport: "football",
    position: "Forward",
    role: "Right Winger",
    image: "https://media.api-sports.io/football/players/1468.png",
    provider: "football",
    externalId: "1468",
    stats: { goals: 68, assists: 60, appearances: 240 }
  }
];

async function main() {
  console.log(`Starting upsert for ${REAL_PLAYERS.length} international superstars...`);
  let count = 0;

  for (const p of REAL_PLAYERS) {
    const statsJson = JSON.stringify(p.stats);

    // Find if already exists by externalId or name+sport
    const existing = await prisma.player.findFirst({
      where: {
        OR: [
          { externalId: p.externalId, provider: p.provider },
          { name: { equals: p.name, mode: "insensitive" }, sport: p.sport }
        ]
      }
    });

    if (existing) {
      await prisma.player.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          shortName: p.shortName,
          country: p.country,
          sport: p.sport,
          position: p.position,
          role: p.role,
          image: p.image,
          statsJson: statsJson,
          externalId: p.externalId,
          provider: p.provider,
          lastUpdated: new Date()
        }
      });
      console.log(`Updated: ${p.name} (${p.sport})`);
    } else {
      await prisma.player.create({
        data: {
          name: p.name,
          shortName: p.shortName,
          country: p.country,
          sport: p.sport,
          position: p.position,
          role: p.role,
          image: p.image,
          statsJson: statsJson,
          externalId: p.externalId,
          provider: p.provider,
          lastUpdated: new Date()
        }
      });
      console.log(`Created: ${p.name} (${p.sport})`);
    }
    count++;
  }

  const finalTotal = await prisma.player.count();
  console.log(`Done! Upserted ${count} players. Total players in DB now: ${finalTotal}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
