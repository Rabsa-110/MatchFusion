// backend/lib/aliases.js
// Centralized search normalization and team/country aliases for MatchFusion.

export const TEAM_ALIASES = {
  // Cricket International
  ban: ["bangladesh", "tigers", "bgd"],
  bd: ["bangladesh", "tigers", "bgd"],
  bgd: ["bangladesh", "tigers", "bd", "ban"],
  bangladesh: ["bd", "ban", "bgd", "tigers"],
  tigers: ["bangladesh", "bd", "ban"],
  ind: ["india", "bharat", "men in blue"],
  india: ["ind", "bharat", "men in blue"],
  aus: ["australia", "aussies"],
  australia: ["aus", "aussies"],
  aussies: ["australia", "aus"],
  eng: ["england", "three lions"],
  england: ["eng", "three lions"],
  pak: ["pakistan", "shaheens", "green shirts"],
  pakistan: ["pak", "shaheens", "green shirts"],
  sl: ["sri lanka", "lions"],
  sri: ["sri lanka"],
  "sri lanka": ["sl", "sri", "lions"],
  sa: ["south africa", "proteas"],
  rsa: ["south africa", "proteas"],
  "south africa": ["sa", "rsa", "proteas"],
  proteas: ["south africa", "sa", "rsa"],
  nz: ["new zealand", "black caps", "kiwis"],
  "new zealand": ["nz", "black caps", "kiwis"],
  blackcaps: ["new zealand", "nz"],
  afg: ["afghanistan"],
  afghanistan: ["afg"],
  wi: ["west indies", "windies"],
  windies: ["west indies", "wi"],
  "west indies": ["wi", "windies"],
  zim: ["zimbabwe"],
  zimbabwe: ["zim"],
  ire: ["ireland"],
  ireland: ["ire"],
  ned: ["netherlands"],
  netherlands: ["ned", "holland"],
  hk: ["hong kong", "sixes", "hong kong sixes"],
  "hong kong": ["hk", "sixes", "hong kong sixes"],
  sixes: ["hong kong sixes", "hk sixes", "hong kong"],
  "hong kong sixes": ["sixes", "hk", "hong kong"],

  // Football Clubs
  rma: ["real madrid", "los blancos", "madrid"],
  "real madrid": ["rma", "madrid", "los blancos"],
  "los blancos": ["real madrid", "rma"],
  bar: ["barcelona", "barca", "blaugrana", "fc barcelona"],
  barca: ["barcelona", "fc barcelona", "blaugrana"],
  barcelona: ["bar", "barca", "blaugrana", "fc barcelona"],
  blaugrana: ["barcelona", "barca"],
  mci: ["manchester city", "man city", "city", "citizens"],
  "man city": ["manchester city", "mci"],
  "manchester city": ["mci", "man city", "city"],
  mun: ["manchester united", "man utd", "united", "red devils"],
  "man utd": ["manchester united", "mun"],
  "manchester united": ["mun", "man utd", "united", "red devils"],
  "red devils": ["manchester united", "mun"],
  ars: ["arsenal", "gunners"],
  arsenal: ["ars", "gunners"],
  gunners: ["arsenal", "ars"],
  liv: ["liverpool", "reds"],
  liverpool: ["liv", "reds"],
  che: ["chelsea", "blues"],
  chelsea: ["che", "blues"],
  blues: ["chelsea", "che"],
  tot: ["tottenham", "spurs", "tottenham hotspur"],
  spurs: ["tottenham", "tottenham hotspur"],
  tottenham: ["tot", "spurs"],
  bay: ["bayern munich", "bayern", "fc bayern"],
  bayern: ["bayern munich", "bay"],
  "bayern munich": ["bay", "bayern"],
  bvb: ["borussia dortmund", "dortmund"],
  dortmund: ["borussia dortmund", "bvb"],
  "borussia dortmund": ["bvb", "dortmund"],
  psg: ["paris saint germain", "paris"],
  "paris saint germain": ["psg", "paris"],
  "paris saint-germain": ["psg", "paris"],
  juv: ["juventus", "juve"],
  juventus: ["juv", "juve"],
  juve: ["juventus", "juv"],
  mil: ["ac milan", "milan", "rossoneri"],
  "ac milan": ["mil", "milan", "rossoneri"],
  int: ["inter milan", "inter", "nerazzurri"],
  "inter milan": ["int", "inter", "nerazzurri"],
  atm: ["atletico madrid", "atleti"],
  "atletico madrid": ["atm", "atleti"],

  // Competitions
  ucl: ["champions league", "uefa champions league"],
  uel: ["europa league", "uefa europa league"],
  pl: ["premier league", "english premier league", "epl"],
  epl: ["premier league", "english premier league"],
  ipl: ["indian premier league"],
  bbl: ["big bash league"],
  psl: ["pakistan super league"],
  bpl: ["bangladesh premier league"],
  cpl: ["caribbean premier league"],
  sa20: ["sa20", "south africa t20"],
};

/**
 * Normalizes query string and expands it into an array of search tokens / aliases.
 * Supports bidirectional lookup (e.g. "BGD" -> "bangladesh", "tigers" -> "bangladesh").
 * @param {string} rawQuery
 * @returns {string[]}
 */
export function getExpandedSearchTerms(rawQuery) {
  if (!rawQuery || typeof rawQuery !== "string") return [];
  const clean = rawQuery.trim().toLowerCase();
  if (!clean) return [];

  const terms = new Set([clean]);

  // Check alias dictionary
  if (TEAM_ALIASES[clean]) {
    for (const alias of TEAM_ALIASES[clean]) {
      terms.add(alias.toLowerCase());
    }
  }

  // Bidirectional search: check both keys and alias values
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

  return Array.from(terms);
}

/**
 * Checks whether a match record matches the search query based on normalized aliases.
 * @param {Object} match
 * @param {string} query
 * @returns {boolean}
 */
export function matchMatchesSearch(match, query) {
  if (!query || !query.trim()) return true;
  const terms = getExpandedSearchTerms(query);

  const searchableText = [
    match.home?.name,
    match.home?.short,
    match.homeTeam,
    match.homeShort,
    match.away?.name,
    match.away?.short,
    match.awayTeam,
    match.awayShort,
    match.competition,
    match.rawCompetition,
    match.sport,
    match.venue,
    match.status,
    match.statusDetail,
    match.extra?.series,
    match.extra?.matchType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.some((term) => searchableText.includes(term));
}

/**
 * Returns a priority score for competition ordering.
 * Higher score = higher priority in listings.
 */
export function getCompetitionPriority(competitionName = "", sport = "") {
  const c = competitionName.toLowerCase();

  // Tier 1: Top International Football & Cricket
  if (c.includes("world cup") || c.includes("champions trophy") || c.includes("t20 world cup")) return 125;
  if (c.includes("champions league") || c.includes("copa america") || c.includes("euro 20")) return 115;
  if (c.includes("hong kong sixes") || c.includes("hk sixes") || c.includes("sixes")) return 110;
  if (c.includes("test series") || c.includes("odi series") || c.includes("t20i series") || c.includes("tour of")) return 105;

  // Tier 2: Top Professional Leagues
  if (c.includes("premier league") || c.includes("la liga") || c.includes("serie a") || c.includes("bundesliga")) return 95;
  if (c.includes("indian premier league") || c.includes("ipl") || c.includes("big bash") || c.includes("psl")) return 90;
  if (c.includes("ligue 1") || c.includes("europa league")) return 85;

  // Tier 3: Major Franchise & Continental Cups
  if (c.includes("bpl") || c.includes("cpl") || c.includes("sa20") || c.includes("the hundred") || c.includes("super smash")) return 75;
  if (c.includes("fa cup") || c.includes("copa del rey") || c.includes("dfb-pokal") || c.includes("coppa italia") || c.includes("conference league")) return 70;

  // Tier 4: Regional & Domestic
  if (c.includes("ranji") || c.includes("sheffield") || c.includes("duleep") || c.includes("vijay hazare") || c.includes("syed mushtaq")) return 50;

  // Default priority
  return sport === "football" ? 60 : 55;
}
