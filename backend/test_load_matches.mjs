import * as sportsService from './services/sportsService.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const conn = await sportsService.checkDbConnectivity();
  console.log('DB conn:', conn);

  const fbMatches = await sportsService.getMatches('football');
  console.log('Football matches:', fbMatches.length);

  const crMatches = await sportsService.getMatches('cricket');
  console.log('Cricket matches:', crMatches.length);

  const allMatches = await sportsService.getMatches('all');
  console.log('All matches:', allMatches.length);

  const status = sportsService.getCacheStatus();
  console.log('Cache status:', status);
}

main().catch(console.error);

