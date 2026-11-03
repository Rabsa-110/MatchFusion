// frontend/src/utils/aliases.js
// Centralized sports team & competition alias dictionary for frontend search.

export const ALIASES = {
  // Cricket International
  ban: ["bangladesh", "tigers", "bgd"],
  bd: ["bangladesh", "tigers", "bgd"],
  bgd: ["bangladesh", "tigers", "bd", "ban"],
  bangladesh: ["bd", "ban", "bgd", "tigers"],
  ind: ["india", "bharat"],
  india: ["ind", "bharat"],
  aus: ["australia", "aussies"],
  australia: ["aus", "aussies"],
  eng: ["england"],
  england: ["eng"],
  pak: ["pakistan"],
  pakistan: ["pak"],
  sl: ["sri lanka"],
  sri: ["sri lanka"],
  "sri lanka": ["sl", "sri"],
  sa: ["south africa", "proteas"],
  rsa: ["south africa", "proteas"],
  "south africa": ["sa", "rsa", "proteas"],
  nz: ["new zealand", "black caps"],
  "new zealand": ["nz", "black caps"],
  afg: ["afghanistan"],
  afghanistan: ["afg"],
  wi: ["west indies", "windies"],
  windies: ["west indies", "wi"],
  "west indies": ["wi", "windies"],
  hk: ["hong kong", "sixes", "hong kong sixes"],
  "hong kong": ["hk", "sixes", "hong kong sixes"],
  sixes: ["hong kong sixes", "hk sixes", "hong kong"],
  "hong kong sixes": ["sixes", "hk", "hong kong"],

  // Football Clubs
  rma: ["real madrid", "madrid"],
  "real madrid": ["rma", "madrid"],
  bar: ["barcelona", "barca", "fc barcelona"],
  barca: ["barcelona", "fc barcelona"],
  barcelona: ["bar", "barca"],
  mci: ["manchester city", "man city", "city"],
  "man city": ["manchester city", "mci"],
  "manchester city": ["mci", "man city", "city"],
  mun: ["manchester united", "man utd", "united"],
  "man utd": ["manchester united", "mun"],
  "manchester united": ["mun", "man utd", "united"],
  ars: ["arsenal", "gunners"],
  arsenal: ["ars", "gunners"],
  liv: ["liverpool", "reds"],
  liverpool: ["liv", "reds"],
  che: ["chelsea", "blues"],
  chelsea: ["che", "blues"],
  bay: ["bayern munich", "bayern"],
  bayern: ["bayern munich", "bay"],
  "bayern munich": ["bay", "bayern"],
  bvb: ["borussia dortmund", "dortmund"],
  psg: ["paris saint germain", "paris"],
  "paris saint germain": ["psg", "paris"],
  "paris saint-germain": ["psg", "paris"],
  juv: ["juventus", "juve"],
  juventus: ["juv", "juve"],
  mil: ["ac milan", "milan"],
  "ac milan": ["mil", "milan"],
  int: ["inter milan", "inter"],
  "inter milan": ["int", "inter"],
  atm: ["atletico madrid", "atleti"],

  // Competitions
  ucl: ["champions league", "uefa champions league"],
  uel: ["europa league", "uefa europa league"],
  pl: ["premier league", "english premier league", "epl"],
  epl: ["premier league", "english premier league"],
  ipl: ["indian premier league"],
  bbl: ["big bash league"],
  psl: ["pakistan super league"],
  bpl: ["bangladesh premier league"],
};

/**
 * Returns expanded search terms for client-side search filtering.
 * @param {string} raw
 * @returns {string[]}
 */
export function expandSearch(raw = "") {
  const query = raw.trim().toLowerCase();
  if (!query) return [];

  const terms = new Set([query]);
  if (ALIASES[query]) {
    ALIASES[query].forEach((a) => terms.add(a.toLowerCase()));
  }

  for (const [key, aliases] of Object.entries(ALIASES)) {
    if (query.includes(key) || key.includes(query)) {
      aliases.forEach((a) => terms.add(a.toLowerCase()));
      terms.add(key.toLowerCase());
    }
  }

  return Array.from(terms);
}
