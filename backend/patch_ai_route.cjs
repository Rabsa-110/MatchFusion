const fs = require('fs');
const path = require('path');

const aiRoutePath = path.resolve('backend/routes/ai.js');
let aiCode = fs.readFileSync(aiRoutePath, 'utf8');

// 1. Update imports
aiCode = aiCode.replace(
  'import * as sportsService from "../services/sportsService.js";',
  'import * as sportsService from "../services/sportsService.js";\nimport { calculateProbabilities } from "../services/probabilityService.js";'
);

// 2. Remove the old inline calculateProbabilities and parseCricketRuns functions
const calcProbIndex = aiCode.indexOf('export function calculateProbabilities(match) {');
const buildPromptIndex = aiCode.indexOf('export function buildPrompt(match, probs) {');

if (calcProbIndex !== -1 && buildPromptIndex !== -1) {
  aiCode = aiCode.slice(0, calcProbIndex) + aiCode.slice(buildPromptIndex);
  console.log('Replaced inline calculateProbabilities with probabilityService import');
}

fs.writeFileSync(aiRoutePath, aiCode, 'utf8');
console.log('Updated backend/routes/ai.js');
