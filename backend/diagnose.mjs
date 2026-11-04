// Comprehensive diagnostic script for MatchFusion
import prisma from './lib/prisma.js';

console.log('=== MatchFusion DB Diagnostic ===\n');

try {
  // Test basic connectivity
  console.log('Testing DB connection...');
  await prisma.$queryRaw`SELECT 1 as ping`;
  console.log('✅ DB Connected!\n');
  
  // Count all tables
  const matchCount = await prisma.match.count();
  const playerCount = await prisma.player.count();
  const teamCount = await prisma.team.count();
  const userCount = await prisma.user.count();
  const postCount = await prisma.post.count();
  
  console.log('=== Record Counts ===');
  console.log(`Matches: ${matchCount}`);
  console.log(`Players: ${playerCount}`);
  console.log(`Teams:   ${teamCount}`);
  console.log(`Users:   ${userCount}`);
  console.log(`Posts:   ${postCount}`);
  
  if (playerCount > 0) {
    const cricketPlayers = await prisma.player.count({ where: { sport: 'cricket' } });
    const footballPlayers = await prisma.player.count({ where: { sport: 'football' } });
    console.log(`\n  Cricket players: ${cricketPlayers}`);
    console.log(`  Football players: ${footballPlayers}`);
    
    // Sample search
    const dhoni = await prisma.player.findMany({ 
      where: { name: { contains: 'Dhoni', mode: 'insensitive' } },
      select: { name: true, sport: true, country: true }
    });
    console.log(`\n  Dhoni search: ${dhoni.map(p => p.name).join(', ') || 'NOT FOUND'}`);
    
    const shakib = await prisma.player.findMany({ 
      where: { name: { contains: 'Shakib', mode: 'insensitive' } },
      select: { name: true, sport: true, country: true }
    });
    console.log(`  Shakib search: ${shakib.map(p => p.name).join(', ') || 'NOT FOUND'}`);
    
    const cr7 = await prisma.player.findMany({ 
      where: { name: { contains: 'Ronaldo', mode: 'insensitive' } },
      select: { name: true, sport: true }
    });
    console.log(`  Ronaldo search: ${cr7.map(p => p.name).join(', ') || 'NOT FOUND'}`);
    
    // Show top 10
    const sample = await prisma.player.findMany({ take: 10, orderBy: { name: 'asc' } });
    console.log(`\n  First 10 players: ${sample.map(p => `${p.name} (${p.sport})`).join(', ')}`);
  } else {
    console.log('\n⚠️  PLAYER TABLE IS EMPTY - seeds need to be re-run!');
  }
  
  if (matchCount > 0) {
    const liveMatches = await prisma.match.count({ where: { status: 'LIVE' } });
    const upcomingMatches = await prisma.match.count({ where: { status: 'UPCOMING' } });
    const completedMatches = await prisma.match.count({ where: { status: 'COMPLETED' } });
    console.log(`\n  Live: ${liveMatches}, Upcoming: ${upcomingMatches}, Completed: ${completedMatches}`);
    
    const latestMatch = await prisma.match.findFirst({ orderBy: { lastFetchedAt: 'desc' } });
    if (latestMatch) {
      console.log(`  Latest fetch: ${latestMatch.lastFetchedAt?.toISOString()}`);
    }
  }
  
} catch(e) {
  console.error('❌ DB Error:', e.message.split('\n')[0]);
  console.log('\nSupabase may be paused. Visit https://supabase.com/dashboard to resume.');
} finally {
  await prisma.$disconnect();
}

