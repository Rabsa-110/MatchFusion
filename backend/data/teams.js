export const teams = [
  { id: "barcelona", sport: "football", name: "Barcelona", short: "BAR", competition: "La Liga" },
  { id: "real-madrid", sport: "football", name: "Real Madrid", short: "RMA", competition: "La Liga" },
  { id: "bangladesh-cricket", sport: "cricket", name: "Bangladesh", short: "BAN", competition: "International" },
  { id: "india-cricket", sport: "cricket", name: "India", short: "IND", competition: "International" },
];

export const getTeamById = (id) => teams.find((t) => t.id === id);
