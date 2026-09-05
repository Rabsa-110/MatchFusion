export const players = [
  { id: "yamal", sport: "football", name: "Lamine Yamal", team: "Barcelona", position: "Forward", goals: 12, assists: 7 },
  { id: "shakib", sport: "cricket", name: "Shakib Al Hasan", team: "Bangladesh", role: "All-rounder", runs: 412, wickets: 14 },
];

export const getPlayerById = (id) => players.find((p) => p.id === id);
