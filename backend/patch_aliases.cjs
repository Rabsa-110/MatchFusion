const fs = require('fs');
const path = require('path');

const PLAYER_ALIASES_CODE = `
export const PLAYER_ALIASES = {
  // Football Icons
  cr7: ["cristiano ronaldo", "ronaldo", "c. ronaldo"],
  ronaldo: ["cristiano ronaldo", "cr7", "c. ronaldo"],
  "cristiano ronaldo": ["cr7", "ronaldo", "c. ronaldo"],
  "c. ronaldo": ["cristiano ronaldo", "cr7", "ronaldo"],
  messi: ["lionel messi", "leo messi", "l. messi"],
  "lionel messi": ["messi", "leo messi", "l. messi"],
  "leo messi": ["lionel messi", "messi"],
  mbappe: ["kylian mbappe", "kylian mbappé", "k. mbappe"],
  "kylian mbappe": ["mbappe", "kylian mbappé", "k. mbappe"],
  "kylian mbappé": ["mbappe", "kylian mbappe"],
  haaland: ["erling haaland", "e. haaland"],
  "erling haaland": ["haaland", "e. haaland"],
  bellingham: ["jude bellingham", "j. bellingham"],
  "jude bellingham": ["bellingham", "j. bellingham"],
  neymar: ["neymar jr", "neymar junior"],
  "neymar jr": ["neymar", "neymar junior"],
  vinicius: ["vinicius jr", "vinícius júnior", "vini jr"],
  "vinicius jr": ["vinicius", "vinícius júnior", "vini jr"],
  "vini jr": ["vinicius", "vinicius jr", "vinícius júnior"],
  debruyne: ["kevin de bruyne", "k. de bruyne"],
  "kevin de bruyne": ["debruyne", "k. de bruyne"],
  salah: ["mohamed salah", "mo salah", "m. salah"],
  "mohamed salah": ["salah", "mo salah", "m. salah"],
  lewandowski: ["robert lewandowski", "r. lewandowski"],
  "robert lewandowski": ["lewandowski", "r. lewandowski"],
  modric: ["luka modric", "luka modrić", "l. modric"],
  "luka modric": ["modric", "luka modrić"],
  kane: ["harry kane", "h. kane"],
  "harry kane": ["kane", "h. kane"],
  saka: ["bukayo saka", "b. saka"],
  "bukayo saka": ["saka", "b. saka"],

  // Cricket International Icons
  shakib: ["shakib al hasan", "s. al hasan", "shakib al ha"],
  "shakib al hasan": ["shakib", "s. al hasan", "shakib al ha"],
  "shakib al ha": ["shakib al hasan", "shakib", "s. al hasan"],
  tamim: ["tamim iqbal", "t. iqbal"],
  "tamim iqbal": ["tamim", "t. iqbal"],
  mushfiqur: ["mushfiqur rahim", "mushi", "m. rahim"],
  "mushfiqur rahim": ["mushfiqur", "mushi", "m. rahim"],
  mushi: ["mushfiqur rahim", "mushfiqur"],
  mustafizur: ["mustafizur rahman", "the fizz", "fizz", "m. rahman"],
  "mustafizur rahman": ["mustafizur", "the fizz", "fizz", "m. rahman"],
  fizz: ["mustafizur rahman", "mustafizur"],
  kohli: ["virat kohli", "king kohli", "v. kohli"],
  "virat kohli": ["kohli", "king kohli", "v. kohli"],
  "king kohli": ["virat kohli", "kohli"],
  rohit: ["rohit sharma", "hitman", "r. sharma"],
  "rohit sharma": ["rohit", "hitman", "r. sharma"],
  hitman: ["rohit sharma", "rohit"],
  bumrah: ["jasprit bumrah", "j. bumrah"],
  "jasprit bumrah": ["bumrah", "j. bumrah"],
  babar: ["babar azam", "b. azam"],
  "babar azam": ["babar", "b. azam"],
  afridi: ["shaheen afridi", "shaheen shah afridi", "s. afridi"],
  "shaheen afridi": ["afridi", "shaheen shah afridi"],
  "shaheen shah afridi": ["shaheen afridi", "afridi"],
  cummins: ["pat cummins", "p. cummins"],
  "pat cummins": ["cummins", "p. cummins"],
  rashid: ["rashid khan", "r. khan"],
  "rashid khan": ["rashid", "r. khan"],
  root: ["joe root", "j. root"],
  "joe root": ["root", "j. root"],
  williamson: ["kane williamson", "k. williamson"],
  "kane williamson": ["williamson", "k. williamson"],
};
`;

// Helper to replace getExpandedSearchTerms
const NEW_EXPANDED_TERMS = `
/**
 * Normalizes query string and expands it into an array of search tokens / aliases.
 * Supports bidirectional lookup for teams and players, plus individual word tokens.
 * @param {string} rawQuery
 * @returns {string[]}
 */
export function getExpandedSearchTerms(rawQuery) {
  if (!rawQuery || typeof rawQuery !== "string") return [];
  const clean = rawQuery.trim().toLowerCase();
  if (!clean) return [];

  const terms = new Set([clean]);

  // Add individual words if multi-word query (>= 3 chars)
  const words = clean.split(/\\s+/).filter((w) => w.length >= 3);
  words.forEach((w) => terms.add(w));

  // Check TEAM_ALIASES
  if (TEAM_ALIASES[clean]) {
    for (const alias of TEAM_ALIASES[clean]) {
      terms.add(alias.toLowerCase());
    }
  }

  // Check PLAYER_ALIASES
  if (PLAYER_ALIASES && PLAYER_ALIASES[clean]) {
    for (const alias of PLAYER_ALIASES[clean]) {
      terms.add(alias.toLowerCase());
    }
  }

  // Bidirectional search across teams
  for (const [key, aliases] of Object.entries(TEAM_ALIASES)) {
    if (
      clean === key ||
      clean.includes(key) ||
      key.includes(clean) ||
      aliases.some((a) => a === clean || clean.includes(a))
    ) {
      terms.add(key.toLowerCase());
      aliases.forEach((a) => terms.add(a.toLowerCase()));
    }
  }

  // Bidirectional search across players
  if (typeof PLAYER_ALIASES !== "undefined") {
    for (const [key, aliases] of Object.entries(PLAYER_ALIASES)) {
      if (
        clean === key ||
        clean.includes(key) ||
        key.includes(clean) ||
        aliases.some((a) => a === clean || clean.includes(a))
      ) {
        terms.add(key.toLowerCase());
        aliases.forEach((a) => terms.add(a.toLowerCase()));
      }
    }
  }

  return Array.from(terms);
}
`;

// 1. Update backend/lib/aliases.js
const backendAliasesPath = path.resolve('backend/lib/aliases.js');
let backendCode = fs.readFileSync(backendAliasesPath, 'utf8');

if (!backendCode.includes('PLAYER_ALIASES')) {
  // Insert PLAYER_ALIASES right before getExpandedSearchTerms
  const insertIndex = backendCode.indexOf('export function getExpandedSearchTerms');
  backendCode = backendCode.slice(0, insertIndex) + PLAYER_ALIASES_CODE + '\n' + backendCode.slice(insertIndex);
}

// Replace getExpandedSearchTerms implementation
backendCode = backendCode.replace(
  /\/\*\*[\s\S]*?export function getExpandedSearchTerms[\s\S]*?\n\}/,
  NEW_EXPANDED_TERMS.trim()
);

fs.writeFileSync(backendAliasesPath, backendCode, 'utf8');
console.log('Updated backend/lib/aliases.js');

// 2. Update frontend/src/utils/aliases.js
const frontendAliasesPath = path.resolve('frontend/src/utils/aliases.js');
let frontendCode = fs.readFileSync(frontendAliasesPath, 'utf8');

if (!frontendCode.includes('PLAYER_ALIASES')) {
  const insertIndex = frontendCode.indexOf('export function expandSearch') !== -1 
    ? frontendCode.indexOf('export function expandSearch')
    : frontendCode.indexOf('export function getExpandedSearchTerms');
  frontendCode = frontendCode.slice(0, insertIndex) + PLAYER_ALIASES_CODE + '\n' + frontendCode.slice(insertIndex);
}

frontendCode = frontendCode.replace(
  /\/\*\*[\s\S]*?export function (?:expandSearch|getExpandedSearchTerms)[\s\S]*?\n\}/,
  NEW_EXPANDED_TERMS.trim().replace('export function getExpandedSearchTerms', 'export function expandSearch')
);

fs.writeFileSync(frontendAliasesPath, frontendCode, 'utf8');
console.log('Updated frontend/src/utils/aliases.js');
