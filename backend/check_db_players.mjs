import prisma from './lib/prisma.js';

try {
  const count = await prisma.player.count();
  console.log('Total players in DB:', count);
  
  const sample = await prisma.player.findMany({ take: 5, orderBy: { name: 'asc' } });
  console.log('Sample players:', sample.map(p => `${p.name} (${p.sport})`));
  
  const footballCount = await prisma.player.count({ where: { sport: 'football' } });
  const cricketCount = await prisma.player.count({ where: { sport: 'cricket' } });
  console.log(`Football: ${footballCount}, Cricket: ${cricketCount}`);
  
  // Check for Dhoni specifically
  const dhoni = await prisma.player.findMany({ 
    where: { name: { contains: 'Dhoni', mode: 'insensitive' } }
  });
  console.log('Dhoni search:', dhoni.map(p => p.name));
  
  // Check match count
  const matchCount = await prisma.match.count();
  console.log('Total matches in DB:', matchCount);
  
} catch(e) {
  console.error('DB Error:', e.message);
} finally {
  await prisma.$disconnect();
}

