// Placeholder match data used until the real sports API integration is
// finished and verified (see PROGRESS.md, "Sports data source" decision).
// Shape intentionally mirrors what the football/cricket API is expected to
// provide, so swapping this file for a live fetch later is a small change.

export const matches = [
  {
    id: "fb-1",
    sport: "football",
    competition: "UEFA Champions League",
    status: "live",
    minute: "78'",
    home: { name: "Barcelona", short: "BAR" },
    away: { name: "Real Madrid", short: "RMA" },
    scoreHome: 2,
    scoreAway: 1,
  },
  {
    id: "ck-1",
    sport: "cricket",
    competition: "T20 Series",
    status: "live",
    over: "27.3 overs",
    home: { name: "Bangladesh", short: "BAN" },
    away: { name: "India", short: "IND" },
    scoreHome: "164/5",
    scoreAway: "—",
  },
  {
    id: "fb-2",
    sport: "football",
    competition: "Premier League",
    status: "upcoming",
    date: "2026-08-24",
    time: "20:30",
    home: { name: "Manchester City", short: "MCI" },
    away: { name: "Arsenal", short: "ARS" },
  },
];

export const getMatchById = (id) => matches.find((m) => m.id === id);
