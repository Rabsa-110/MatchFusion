// frontend/src/utils/aliases.js
// Centralized sports team & competition alias dictionary for frontend search.

export const ALIASES = {
  ban: ["bangladesh", "tigers"],
  bd: ["bangladesh", "tigers"],
  bangladesh: ["bd", "ban", "tigers"],
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

  // Football
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
  tot: ["tottenham", "spurs"],
  spurs: ["tottenham"],
  bay: ["bayern munich", "bayern"],
  bayern: ["bayern munich", "bay"],
  "bayern munich": ["bay", "bayern"],
  bvb: ["borussia dortmund", "dortmund"],
  dortmund: ["borussia dortmund", "bvb"],
  psg: ["paris saint germain", "paris"],
  ucl: ["champions league"],
  pl: ["premier league", "epl"],
  epl: ["premier league"],
  ipl: ["indian premier league"],
  bbl: ["big bash league"],
  psl: ["pakistan super league"],
  bpl: ["bangladesh premier league"],
};

export function expandSearch(query) {
  if (!query || typeof query !== "string") return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = new Set([q]);
  if (ALIASES[q]) {
    ALIASES[q].forEach((a) => terms.add(a));
  }
  for (const [key, list] of Object.entries(ALIASES)) {
    if (q === key || q.includes(key)) {
      list.forEach((item) => terms.add(item));
    }
  }
  return Array.from(terms);
}
