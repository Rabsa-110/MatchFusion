import { calculateProbabilities } from './services/probabilityService.js';

console.log('--- 1. Manipur vs Sikkim (Day 3 Lead 224) ---');
console.log(calculateProbabilities({
  sport: 'cricket',
  status: 'LIVE',
  statusDetail: 'Day 3: Stumps - Sikkim lead by 224 runs',
  home: { name: 'Manipur' },
  away: { name: 'Sikkim' },
}));

console.log('\n--- 2. Upcoming Bangladesh vs India (Cricket) ---');
console.log(calculateProbabilities({
  sport: 'cricket',
  status: 'UPCOMING',
  home: { name: 'Bangladesh' },
  away: { name: 'India' },
}));

console.log('\n--- 3. Upcoming Real Madrid vs Barcelona (Football) ---');
console.log(calculateProbabilities({
  sport: 'football',
  status: 'UPCOMING',
  home: { name: 'Real Madrid' },
  away: { name: 'Barcelona' },
}));

console.log('\n--- 4. Live Football 2-0 at 82 min ---');
console.log(calculateProbabilities({
  sport: 'football',
  status: 'LIVE',
  statusDetail: "82'",
  scoreHome: "2",
  scoreAway: "0",
  home: { name: 'Arsenal' },
  away: { name: 'Chelsea' },
}));
