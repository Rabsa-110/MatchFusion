const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'services', 'footballProvider.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the season calculation in fetchUpcomingFootball
// The bug: returns current year (2026) but free plan only allows 2022-2024
const badSeasonCalc = `const season = (function() { if (process.env.API_FOOTBALL_SEASON) return parseInt(process.env.API_FOOTBALL_SEASON, 10); const n = new Date(); return n.getMonth() >= 6 ? n.getFullYear() : n.getFullYear() - 1; })();`;
const goodSeasonCalc = `const season = process.env.API_FOOTBALL_SEASON ? parseInt(process.env.API_FOOTBALL_SEASON, 10) : 2024; // Free plan max season`;

// Count occurrences before
const count = (content.match(new RegExp(badSeasonCalc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log(`Found ${count} occurrences of bad season calc`);

// Replace all occurrences
content = content.split(badSeasonCalc).join(goodSeasonCalc);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed football season calculation - hardcoded to 2024 (free plan max)');

// Verify
const verifyContent = fs.readFileSync(filePath, 'utf8');
const remaining = (verifyContent.match(/n\.getMonth\(\) >= 6 \? n\.getFullYear/g) || []).length;
console.log(`Remaining bad patterns: ${remaining}`);
console.log('Done!');
