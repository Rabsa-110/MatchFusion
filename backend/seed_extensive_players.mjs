import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// Helper to find or match a teamId
async function findTeamId(teamName, sport) {
  if (!teamName) return null;
  const clean = teamName.toLowerCase().trim();
  const team = await prisma.team.findFirst({
    where: {
      sport,
      OR: [
        { name: { equals: teamName, mode: 'insensitive' } },
        { name: { contains: teamName, mode: 'insensitive' } }
      ]
    }
  });
  return team ? team.id : null;
}

const EXTENSIVE_PLAYERS = [
  // ─────────────────────────────────────────────────────────────────────────────
  // ── INDIA CRICKET ────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  {
    name: "MS Dhoni",
    shortName: "MS Dhoni",
    country: "India",
    sport: "cricket",
    position: "Wicketkeeper Batter",
    role: "Right-hand bat · Wicketkeeper (Captain Cool)",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170677/ms-dhoni.jpg",
    provider: "cricket",
    externalId: "ms-dhoni-ind",
    stats: { runs: 17266, wickets: 1, appearances: 538, stumpings: 195 }
  },
  {
    name: "Hardik Pandya",
    shortName: "H. Pandya",
    country: "India",
    sport: "cricket",
    position: "All-rounder",
    role: "Right-hand bat · Right-arm fast-medium",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170666/hardik-pandya.jpg",
    provider: "cricket",
    externalId: "hardik-pandya-ind",
    stats: { runs: 3750, wickets: 175, appearances: 210 }
  },
  {
    name: "KL Rahul",
    shortName: "KL Rahul",
    country: "India",
    sport: "cricket",
    position: "Wicketkeeper Batter",
    role: "Right-hand bat · Wicketkeeper",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170682/kl-rahul.jpg",
    provider: "cricket",
    externalId: "kl-rahul-ind",
    stats: { runs: 7900, wickets: 0, appearances: 205 }
  },
  {
    name: "Rishabh Pant",
    shortName: "R. Pant",
    country: "India",
    sport: "cricket",
    position: "Wicketkeeper Batter",
    role: "Left-hand bat · Wicketkeeper",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170687/rishabh-pant.jpg",
    provider: "cricket",
    externalId: "rishabh-pant-ind",
    stats: { runs: 4600, wickets: 0, appearances: 145 }
  },
  {
    name: "Ravindra Jadeja",
    shortName: "R. Jadeja",
    country: "India",
    sport: "cricket",
    position: "All-rounder",
    role: "Left-hand bat · Slow left-arm orthodox",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170670/ravindra-jadeja.jpg",
    provider: "cricket",
    externalId: "ravindra-jadeja-ind",
    stats: { runs: 6200, wickets: 580, appearances: 340 }
  },
  {
    name: "Suryakumar Yadav",
    shortName: "S. Yadav",
    country: "India",
    sport: "cricket",
    position: "Top-order Batter",
    role: "Right-hand bat (Mr. 360)",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170684/suryakumar-yadav.jpg",
    provider: "cricket",
    externalId: "suryakumar-yadav-ind",
    stats: { runs: 3100, wickets: 0, appearances: 110 }
  },
  {
    name: "Shubman Gill",
    shortName: "S. Gill",
    country: "India",
    sport: "cricket",
    position: "Opening Batter",
    role: "Right-hand bat",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170688/shubman-gill.jpg",
    provider: "cricket",
    externalId: "shubman-gill-ind",
    stats: { runs: 4700, wickets: 0, appearances: 105 }
  },
  {
    name: "Mohammed Shami",
    shortName: "M. Shami",
    country: "India",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Right-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170679/mohammed-shami.jpg",
    provider: "cricket",
    externalId: "mohammed-shami-ind",
    stats: { runs: 1200, wickets: 450, appearances: 195 }
  },
  {
    name: "Mohammed Siraj",
    shortName: "M. Siraj",
    country: "India",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Right-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170691/mohammed-siraj.jpg",
    provider: "cricket",
    externalId: "mohammed-siraj-ind",
    stats: { runs: 210, wickets: 190, appearances: 95 }
  },
  {
    name: "Kuldeep Yadav",
    shortName: "K. Yadav",
    country: "India",
    sport: "cricket",
    position: "Spin Bowler",
    role: "Left-arm wrist spin",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170689/kuldeep-yadav.jpg",
    provider: "cricket",
    externalId: "kuldeep-yadav-ind",
    stats: { runs: 280, wickets: 310, appearances: 160 }
  },
  {
    name: "Yashasvi Jaiswal",
    shortName: "Y. Jaiswal",
    country: "India",
    sport: "cricket",
    position: "Opening Batter",
    role: "Left-hand bat",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c352358/yashasvi-jaiswal.jpg",
    provider: "cricket",
    externalId: "yashasvi-jaiswal-ind",
    stats: { runs: 2100, wickets: 0, appearances: 35 }
  },
  {
    name: "Sanju Samson",
    shortName: "S. Samson",
    country: "India",
    sport: "cricket",
    position: "Wicketkeeper Batter",
    role: "Right-hand bat · Wicketkeeper",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170680/sanju-samson.jpg",
    provider: "cricket",
    externalId: "sanju-samson-ind",
    stats: { runs: 1650, wickets: 0, appearances: 55 }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ── BANGLADESH CRICKET ───────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  {
    name: "Mahmudullah",
    shortName: "Mahmudullah",
    country: "Bangladesh",
    sport: "cricket",
    position: "All-rounder",
    role: "Right-hand bat · Right-arm offbreak",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170915/mahmudullah.jpg",
    provider: "cricket",
    externalId: "mahmudullah-bd",
    stats: { runs: 10400, wickets: 165, appearances: 430 }
  },
  {
    name: "Litton Das",
    shortName: "L. Das",
    country: "Bangladesh",
    sport: "cricket",
    position: "Wicketkeeper Batter",
    role: "Right-hand bat · Wicketkeeper",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170921/litton-das.jpg",
    provider: "cricket",
    externalId: "litton-das-bd",
    stats: { runs: 7100, wickets: 0, appearances: 220 }
  },
  {
    name: "Mehidy Hasan Miraz",
    shortName: "M. Hasan Miraz",
    country: "Bangladesh",
    sport: "cricket",
    position: "All-rounder",
    role: "Right-hand bat · Right-arm offbreak",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170927/mehidy-hasan.jpg",
    provider: "cricket",
    externalId: "mehidy-hasan-bd",
    stats: { runs: 3950, wickets: 320, appearances: 195 }
  },
  {
    name: "Taskin Ahmed",
    shortName: "T. Ahmed",
    country: "Bangladesh",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Right-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170923/taskin-ahmed.jpg",
    provider: "cricket",
    externalId: "taskin-ahmed-bd",
    stats: { runs: 580, wickets: 245, appearances: 155 }
  },
  {
    name: "Shoriful Islam",
    shortName: "S. Islam",
    country: "Bangladesh",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Left-arm medium-fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c244976/shoriful-islam.jpg",
    provider: "cricket",
    externalId: "shoriful-islam-bd",
    stats: { runs: 120, wickets: 135, appearances: 80 }
  },
  {
    name: "Towhid Hridoy",
    shortName: "T. Hridoy",
    country: "Bangladesh",
    sport: "cricket",
    position: "Middle-order Batter",
    role: "Right-hand bat",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c245037/towhid-hridoy.jpg",
    provider: "cricket",
    externalId: "towhid-hridoy-bd",
    stats: { runs: 1850, wickets: 0, appearances: 55 }
  },
  {
    name: "Najmul Hossain Shanto",
    shortName: "N. Hossain Shanto",
    country: "Bangladesh",
    sport: "cricket",
    position: "Top-order Batter",
    role: "Left-hand bat (Captain)",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170928/najmul-hossain-shanto.jpg",
    provider: "cricket",
    externalId: "najmul-hossain-shanto-bd",
    stats: { runs: 4200, wickets: 2, appearances: 130 }
  },
  {
    name: "Rishad Hossain",
    shortName: "R. Hossain",
    country: "Bangladesh",
    sport: "cricket",
    position: "Spin Bowler",
    role: "Right-arm legbreak",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c352378/rishad-hossain.jpg",
    provider: "cricket",
    externalId: "rishad-hossain-bd",
    stats: { runs: 340, wickets: 55, appearances: 35 }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ── AUSTRALIA & ENGLAND CRICKET ──────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  {
    name: "David Warner",
    shortName: "D. Warner",
    country: "Australia",
    sport: "cricket",
    position: "Opening Batter",
    role: "Left-hand bat",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170635/david-warner.jpg",
    provider: "cricket",
    externalId: "david-warner-aus",
    stats: { runs: 18995, wickets: 4, appearances: 383 }
  },
  {
    name: "Steve Smith",
    shortName: "S. Smith",
    country: "Australia",
    sport: "cricket",
    position: "Top-order Batter",
    role: "Right-hand bat · Legbreak",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170637/steve-smith.jpg",
    provider: "cricket",
    externalId: "steve-smith-aus",
    stats: { runs: 16200, wickets: 65, appearances: 330 }
  },
  {
    name: "Mitchell Starc",
    shortName: "M. Starc",
    country: "Australia",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Left-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170643/mitchell-starc.jpg",
    provider: "cricket",
    externalId: "mitchell-starc-aus",
    stats: { runs: 2450, wickets: 680, appearances: 275 }
  },
  {
    name: "Glenn Maxwell",
    shortName: "G. Maxwell",
    country: "Australia",
    sport: "cricket",
    position: "All-rounder",
    role: "Right-hand bat · Right-arm offbreak (The Big Show)",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170640/glenn-maxwell.jpg",
    provider: "cricket",
    externalId: "glenn-maxwell-aus",
    stats: { runs: 6800, wickets: 145, appearances: 245 }
  },
  {
    name: "Travis Head",
    shortName: "T. Head",
    country: "Australia",
    sport: "cricket",
    position: "Opening Batter",
    role: "Left-hand bat · Right-arm offbreak",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170648/travis-head.jpg",
    provider: "cricket",
    externalId: "travis-head-aus",
    stats: { runs: 6100, wickets: 32, appearances: 140 }
  },
  {
    name: "Adam Zampa",
    shortName: "A. Zampa",
    country: "Australia",
    sport: "cricket",
    position: "Spin Bowler",
    role: "Right-arm legbreak",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170649/adam-zampa.jpg",
    provider: "cricket",
    externalId: "adam-zampa-aus",
    stats: { runs: 280, wickets: 310, appearances: 190 }
  },
  {
    name: "Jos Buttler",
    shortName: "J. Buttler",
    country: "England",
    sport: "cricket",
    position: "Wicketkeeper Batter",
    role: "Right-hand bat · Wicketkeeper (Captain)",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170619/jos-buttler.jpg",
    provider: "cricket",
    externalId: "jos-buttler-eng",
    stats: { runs: 10800, wickets: 0, appearances: 360 }
  },
  {
    name: "Ben Stokes",
    shortName: "B. Stokes",
    country: "England",
    sport: "cricket",
    position: "All-rounder",
    role: "Left-hand bat · Right-arm fast-medium",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170621/ben-stokes.jpg",
    provider: "cricket",
    externalId: "ben-stokes-eng",
    stats: { runs: 10100, wickets: 310, appearances: 260 }
  },
  {
    name: "Jofra Archer",
    shortName: "J. Archer",
    country: "England",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Right-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170631/jofra-archer.jpg",
    provider: "cricket",
    externalId: "jofra-archer-eng",
    stats: { runs: 350, wickets: 145, appearances: 70 }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ── PAKISTAN & SOUTH AFRICA & WI CRICKET ─────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  {
    name: "Mohammad Rizwan",
    shortName: "M. Rizwan",
    country: "Pakistan",
    sport: "cricket",
    position: "Wicketkeeper Batter",
    role: "Right-hand bat · Wicketkeeper",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170764/mohammad-rizwan.jpg",
    provider: "cricket",
    externalId: "mohammad-rizwan-pak",
    stats: { runs: 7600, wickets: 0, appearances: 215 }
  },
  {
    name: "Naseem Shah",
    shortName: "N. Shah",
    country: "Pakistan",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Right-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170783/naseem-shah.jpg",
    provider: "cricket",
    externalId: "naseem-shah-pak",
    stats: { runs: 240, wickets: 135, appearances: 65 }
  },
  {
    name: "Heinrich Klaasen",
    shortName: "H. Klaasen",
    country: "South Africa",
    sport: "cricket",
    position: "Wicketkeeper Batter",
    role: "Right-hand bat · Wicketkeeper",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170707/heinrich-klaasen.jpg",
    provider: "cricket",
    externalId: "heinrich-klaasen-sa",
    stats: { runs: 3400, wickets: 0, appearances: 110 }
  },
  {
    name: "Kagiso Rabada",
    shortName: "K. Rabada",
    country: "South Africa",
    sport: "cricket",
    position: "Fast Bowler",
    role: "Right-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170704/kagiso-rabada.jpg",
    provider: "cricket",
    externalId: "kagiso-rabada-sa",
    stats: { runs: 1450, wickets: 530, appearances: 220 }
  },
  {
    name: "Nicholas Pooran",
    shortName: "N. Pooran",
    country: "West Indies",
    sport: "cricket",
    position: "Wicketkeeper Batter",
    role: "Left-hand bat · Wicketkeeper",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170821/nicholas-pooran.jpg",
    provider: "cricket",
    externalId: "nicholas-pooran-wi",
    stats: { runs: 4900, wickets: 6, appearances: 175 }
  },
  {
    name: "Andre Russell",
    shortName: "A. Russell",
    country: "West Indies",
    sport: "cricket",
    position: "All-rounder",
    role: "Right-hand bat · Right-arm fast",
    image: "https://static.cricbuzz.com/a/img/v1/152x152/i1/c170817/andre-russell.jpg",
    provider: "cricket",
    externalId: "andre-russell-wi",
    stats: { runs: 8500, wickets: 420, appearances: 490 }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ── FOOTBALL SUPERSTARS (BARCELONA, REAL MADRID, MAN CITY, ARSENAL, CHELSEA) ───
  // ─────────────────────────────────────────────────────────────────────────────
  {
    name: "Lamine Yamal",
    shortName: "L. Yamal",
    country: "Spain",
    sport: "football",
    position: "Forward",
    role: "Right Winger",
    image: "https://media.api-sports.io/football/players/384022.png",
    provider: "football",
    externalId: "384022",
    stats: { goals: 18, assists: 22, appearances: 70 }
  },
  {
    name: "Pedri",
    shortName: "Pedri",
    country: "Spain",
    sport: "football",
    position: "Midfielder",
    role: "Central Midfielder",
    image: "https://media.api-sports.io/football/players/138433.png",
    provider: "football",
    externalId: "138433",
    stats: { goals: 25, assists: 18, appearances: 165 }
  },
  {
    name: "Raphinha",
    shortName: "Raphinha",
    country: "Brazil",
    sport: "football",
    position: "Forward",
    role: "Left / Right Winger",
    image: "https://media.api-sports.io/football/players/483.png",
    provider: "football",
    externalId: "483",
    stats: { goals: 82, assists: 65, appearances: 280 }
  },
  {
    name: "Rodri",
    shortName: "Rodri",
    country: "Spain",
    sport: "football",
    position: "Midfielder",
    role: "Defensive Midfielder (Ballon d'Or)",
    image: "https://media.api-sports.io/football/players/44.png",
    provider: "football",
    externalId: "44",
    stats: { goals: 42, assists: 38, appearances: 430 }
  },
  {
    name: "Phil Foden",
    shortName: "P. Foden",
    country: "England",
    sport: "football",
    position: "Forward",
    role: "Attacking Midfielder / Winger",
    image: "https://media.api-sports.io/football/players/631.png",
    provider: "football",
    externalId: "631",
    stats: { goals: 90, assists: 55, appearances: 280 }
  },
  {
    name: "Cole Palmer",
    shortName: "C. Palmer",
    country: "England",
    sport: "football",
    position: "Forward",
    role: "Attacking Midfielder / Right Winger",
    image: "https://media.api-sports.io/football/players/152982.png",
    provider: "football",
    externalId: "152982-cp",
    stats: { goals: 38, assists: 25, appearances: 85 }
  },
  {
    name: "Martin Ødegaard",
    shortName: "M. Ødegaard",
    country: "Norway",
    sport: "football",
    position: "Midfielder",
    role: "Attacking Midfielder (Captain)",
    image: "https://media.api-sports.io/football/players/371.png",
    provider: "football",
    externalId: "371",
    stats: { goals: 55, assists: 50, appearances: 290 }
  },
  {
    name: "Declan Rice",
    shortName: "D. Rice",
    country: "England",
    sport: "football",
    position: "Midfielder",
    role: "Defensive / Central Midfielder",
    image: "https://media.api-sports.io/football/players/293.png",
    provider: "football",
    externalId: "293",
    stats: { goals: 28, assists: 24, appearances: 320 }
  },
  {
    name: "Virgil van Dijk",
    shortName: "V. van Dijk",
    country: "Netherlands",
    sport: "football",
    position: "Defender",
    role: "Centre-Back (Captain)",
    image: "https://media.api-sports.io/football/players/290.png",
    provider: "football",
    externalId: "290",
    stats: { goals: 32, assists: 12, appearances: 540 }
  },
  {
    name: "Jamal Musiala",
    shortName: "J. Musiala",
    country: "Germany",
    sport: "football",
    position: "Midfielder",
    role: "Attacking Midfielder / Winger",
    image: "https://media.api-sports.io/football/players/138814.png",
    provider: "football",
    externalId: "138814",
    stats: { goals: 52, assists: 38, appearances: 185 }
  },
  {
    name: "Florian Wirtz",
    shortName: "F. Wirtz",
    country: "Germany",
    sport: "football",
    position: "Midfielder",
    role: "Attacking Midfielder",
    image: "https://media.api-sports.io/football/players/162000.png",
    provider: "football",
    externalId: "162000",
    stats: { goals: 54, assists: 60, appearances: 175 }
  },
  {
    name: "Lautaro Martínez",
    shortName: "L. Martínez",
    country: "Argentina",
    sport: "football",
    position: "Forward",
    role: "Centre-Forward",
    image: "https://media.api-sports.io/football/players/2822.png",
    provider: "football",
    externalId: "2822",
    stats: { goals: 155, assists: 48, appearances: 330 }
  },
  {
    name: "Heung-min Son",
    shortName: "H. Son",
    country: "South Korea",
    sport: "football",
    position: "Forward",
    role: "Left Winger / Centre-Forward",
    image: "https://media.api-sports.io/football/players/186.png",
    provider: "football",
    externalId: "186",
    stats: { goals: 170, assists: 92, appearances: 430 }
  },
  {
    name: "Bruno Fernandes",
    shortName: "B. Fernandes",
    country: "Portugal",
    sport: "football",
    position: "Midfielder",
    role: "Attacking Midfielder",
    image: "https://media.api-sports.io/football/players/1485.png",
    provider: "football",
    externalId: "1485",
    stats: { goals: 165, assists: 135, appearances: 540 }
  }
];

async function main() {
  console.log(`Starting massive player directory update with ${EXTENSIVE_PLAYERS.length} international superstars (including MS Dhoni)...`);
  let count = 0;

  for (const p of EXTENSIVE_PLAYERS) {
    const statsJson = JSON.stringify(p.stats);

    // Try finding team in DB
    const teamId = await findTeamId(p.country, p.sport);

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
          teamId: teamId || existing.teamId,
          lastUpdated: new Date()
        }
      });
      console.log(`Updated: ${p.name} (${p.sport}, ${p.country})`);
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
          teamId: teamId || null,
          lastUpdated: new Date()
        }
      });
      console.log(`Created: ${p.name} (${p.sport}, ${p.country})`);
    }
    count++;
  }

  const finalTotal = await prisma.player.count();
  console.log(`Done! Successfully synced ${count} players. Total players in DB now: ${finalTotal}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

