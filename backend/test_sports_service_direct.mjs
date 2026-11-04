import * as sportsService from './services/sportsService.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Testing sportsService.getMatches...');
  const cacheBefore = sportsService.getCacheStatus();
  console.log('Cache before:', cacheBefore);

  const matches = await sportsService.getMatches('all');
  console.log('Total matches returned by getMatches("all"):', matches.length);

  const cacheAfter = sportsService.getCacheStatus();
  console.log('Cache after:', cacheAfter);

  if (matches.length > 0) {
    const live = matches.filter(m => m.status === 'LIVE');
    const upcoming = matches.filter(m => m.status === 'UPCOMING');
    const completed = matches.filter(m => m.status === 'COMPLETED');
    console.log(`Live: ${live.length}, Upcoming: ${upcoming.length}, Completed: ${completed.length}`);
  }
}

main().catch(console.error);

