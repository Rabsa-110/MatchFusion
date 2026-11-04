// Centralized search normalization and team/country/player aliases for MatchFusion.

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

export const PLAYER_ALIASES = {
  // Cricket Icons
  dhoni: ["ms dhoni", "m. s. dhoni", "thala", "captain cool", "mahendra singh dhoni"],
  "ms dhoni": ["dhoni", "thala", "captain cool", "m. s. dhoni", "mahendra singh dhoni"],
  "m. s. dhoni": ["ms dhoni", "dhoni", "thala"],
  thala: ["ms dhoni", "dhoni", "captain cool"],
  "captain cool": ["ms dhoni", "dhoni", "thala"],
  hardik: ["hardik pandya", "h. pandya"],
  "hardik pandya": ["hardik", "h. pandya"],
  pant: ["rishabh pant", "r. pant"],
  "rishabh pant": ["pant", "r. pant"],
  rahul: ["kl rahul", "k. l. rahul"],
  "kl rahul": ["rahul", "k. l. rahul"],
  surya: ["suryakumar yadav", "sky"],
  sky: ["suryakumar yadav", "surya"],
  "suryakumar yadav": ["surya", "sky"],
  gill: ["shubman gill", "s. gill"],
  "shubman gill": ["gill", "s. gill"],
  shami: ["mohammed shami", "m. shami"],
  "mohammed shami": ["shami", "m. shami"],
  siraj: ["mohammed siraj", "m. siraj"],
  "mohammed siraj": ["siraj", "m. siraj"],
  kuldeep: ["kuldeep yadav", "k. yadav"],
  "kuldeep yadav": ["kuldeep", "k. yadav"],
  jaiswal: ["yashasvi jaiswal", "y. jaiswal"],
  "yashasvi jaiswal": ["jaiswal", "y. jaiswal"],
  samson: ["sanju samson", "s. samson"],
  "sanju samson": ["samson", "s. samson"],
  jadeja: ["ravindra jadeja", "jaddu", "r. jadeja"],
  "ravindra jadeja": ["jadeja", "jaddu", "r. jadeja"],
  jaddu: ["ravindra jadeja", "jadeja"],

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
  mahmudullah: ["mahmudullah", "mahmudullah riyad", "riyad"],
  litton: ["litton das", "l. das"],
  "litton das": ["litton", "l. das"],
  miraz: ["mehidy hasan miraz", "mehidy hasan", "m. hasan miraz"],
  "mehidy hasan": ["miraz", "mehidy hasan miraz"],
  "mehidy hasan miraz": ["miraz", "mehidy hasan"],
  taskin: ["taskin ahmed", "t. ahmed"],
  "taskin ahmed": ["taskin", "t. ahmed"],
  shoriful: ["shoriful islam", "s. islam"],
  "shoriful islam": ["shoriful", "s. islam"],
  hridoy: ["towhid hridoy", "t. hridoy"],
  "towhid hridoy": ["hridoy", "t. hridoy"],
  shanto: ["najmul hossain shanto", "shanto"],
  "najmul hossain shanto": ["shanto"],

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
  rizwan: ["mohammad rizwan", "m. rizwan"],
  "mohammad rizwan": ["rizwan", "m. rizwan"],
  afridi: ["shaheen afridi", "shaheen shah afridi", "s. afridi"],
  "shaheen afridi": ["afridi", "shaheen shah afridi"],
  "shaheen shah afridi": ["shaheen afridi", "afridi"],
  cummins: ["pat cummins", "p. cummins"],
  "pat cummins": ["cummins", "p. cummins"],
  warner: ["david warner", "d. warner"],
  "david warner": ["warner", "d. warner"],
  smith: ["steve smith", "s. smith"],
  "steve smith": ["smith", "s. smith"],
  starc: ["mitchell starc", "m. starc"],
  "mitchell starc": ["starc", "m. starc"],
  maxwell: ["glenn maxwell", "the big show", "g. maxwell"],
  "glenn maxwell": ["maxwell", "the big show"],
  head: ["travis head", "t. head"],
  "travis head": ["head", "t. head"],
  buttler: ["jos buttler", "j. buttler"],
  "jos buttler": ["buttler", "j. buttler"],
  stokes: ["ben stokes", "b. stokes"],
  "ben stokes": ["stokes", "b. stokes"],
  archer: ["jofra archer", "j. archer"],
  "jofra archer": ["archer", "j. archer"],
  rashid: ["rashid khan", "r. khan"],
  "rashid khan": ["rashid", "r. khan"],
  root: ["joe root", "j. root"],
  "joe root": ["root", "j. root"],
  williamson: ["kane williamson", "k. williamson"],
  "kane williamson": ["williamson", "k. williamson"],
  rabada: ["kagiso rabada", "k. rabada"],
  "kagiso rabada": ["rabada", "k. rabada"],
  klaasen: ["heinrich klaasen", "h. klaasen"],
  "heinrich klaasen": ["klaasen", "h. klaasen"],
  pooran: ["nicholas pooran", "n. pooran"],
  "nicholas pooran": ["pooran", "n. pooran"],
  russell: ["andre russell", "a. russell", "dre russ"],
  "andre russell": ["russell", "dre russ"],

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
  yamal: ["lamine yamal", "l. yamal"],
  "lamine yamal": ["yamal", "l. yamal"],
  pedri: ["pedri", "pedri gonzález"],
  palmer: ["cole palmer", "c. palmer", "cold palmer"],
  "cole palmer": ["palmer", "cold palmer"],
  foden: ["phil foden", "p. foden"],
  "phil foden": ["foden", "p. foden"],
  rodri: ["rodri", "rodrigo hernández"],
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
  son: ["heung-min son", "h. son", "sonny"],
  "heung-min son": ["son", "sonny"],
  vandijk: ["virgil van dijk", "van dijk", "v. van dijk"],
  "virgil van dijk": ["van dijk", "vandijk"],
  "van dijk": ["virgil van dijk", "vandijk"],
  musiala: ["jamal musiala", "j. musiala"],
  "jamal musiala": ["musiala", "j. musiala"],
  wirtz: ["florian wirtz", "f. wirtz"],
  "florian wirtz": ["wirtz", "f. wirtz"],
  bruno: ["bruno fernandes", "b. fernandes"],
  "bruno fernandes": ["bruno", "b. fernandes"],
};

/**
 * Normalizes query string and expands it into an array of search tokens / aliases.
 * Supports bidirectional lookup for teams and players, plus individual word tokens.
 * @param {string} rawQuery
 * @returns {string[]}
 */
export function expandSearch(rawQuery) {
  if (!rawQuery || typeof rawQuery !== "string") return [];
  const clean = rawQuery.trim().toLowerCase();
  if (!clean) return [];

  const terms = new Set([clean]);

  // Add individual words if multi-word query (>= 3 chars)
  const words = clean.split(/\s+/).filter((w) => w.length >= 3);
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

// Also export as getExpandedSearchTerms for compatibility
export const getExpandedSearchTerms = expandSearch;

/**
 * Checks whether a match record matches the search query based on normalized aliases.
 * @param {Object} match
 * @param {string} query
 * @returns {boolean}
 */
export function matchMatchesSearch(match, query) {
  if (!query || !query.trim()) return true;
  const terms = expandSearch(query);

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
