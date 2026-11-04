const fs = require('fs');
const path = require('path');

function cleanAndFixAliases(filePath, isFrontend) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Extract PLAYER_ALIASES block
  const match = code.match(/export const PLAYER_ALIASES = \{[\s\S]*?\n\};/);
  if (!match) {
    console.error('No PLAYER_ALIASES found in', filePath);
    return;
  }
  const playerAliasesBlock = match[0];
  
  // Remove all occurrences of PLAYER_ALIASES from code
  code = code.replace(/export const PLAYER_ALIASES = \{[\s\S]*?\n\};\n?/g, '');
  
  // Place PLAYER_ALIASES right after TEAM_ALIASES
  const teamAliasesEnd = code.indexOf('};\n\n/**\n * Normalizes query string');
  if (teamAliasesEnd !== -1) {
    code = code.slice(0, teamAliasesEnd + 2) + '\n\n' + playerAliasesBlock + '\n' + code.slice(teamAliasesEnd + 2);
  } else {
    // If comment was slightly different
    const tEnd = code.indexOf('  sa20: ["sa20", "south africa t20"],\n};');
    code = code.slice(0, tEnd + 40) + '\n\n' + playerAliasesBlock + '\n' + code.slice(tEnd + 40);
  }
  
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Fixed order in', filePath);
}

cleanAndFixAliases(path.resolve('backend/lib/aliases.js'), false);
cleanAndFixAliases(path.resolve('frontend/src/utils/aliases.js'), true);
