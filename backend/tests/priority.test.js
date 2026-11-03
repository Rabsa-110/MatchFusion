// backend/tests/priority.test.js
// Unit tests for competition prioritization, search aliases, and match sorting.

import test from "node:test";
import assert from "node:assert/strict";
import {
  getCompetitionPriority,
  getExpandedSearchTerms,
  matchMatchesSearch,
} from "../lib/aliases.js";

// ── 1. Competition Priority Ranking ──────────────────────────────────────────
test("Competition prioritization assigns higher tier to World Cups and Champions League", () => {
  const worldCup = getCompetitionPriority("ICC Cricket World Cup", "cricket");
  const championsLeague = getCompetitionPriority("UEFA Champions League", "football");
  const premierLeague = getCompetitionPriority("Premier League", "football");
  const regionalCup = getCompetitionPriority("Ranji Trophy", "cricket");

  assert.ok(worldCup > premierLeague, "World Cup ranks higher than domestic leagues");
  assert.ok(championsLeague > premierLeague, "UCL ranks higher than domestic leagues");
  assert.ok(premierLeague > regionalCup, "Major leagues rank higher than domestic regional cups");
});

// ── 2. Search Alias Expansion ────────────────────────────────────────────────
test("Alias expansion resolves team abbreviations correctly", () => {
  const bdTerms = getExpandedSearchTerms("BD");
  assert.ok(bdTerms.includes("bangladesh"), "BD expands to bangladesh");

  const rmaTerms = getExpandedSearchTerms("RMA");
  assert.ok(rmaTerms.includes("real madrid"), "RMA expands to real madrid");

  const indTerms = getExpandedSearchTerms("IND");
  assert.ok(indTerms.includes("india"), "IND expands to india");

  const ausTerms = getExpandedSearchTerms("AUS");
  assert.ok(ausTerms.includes("australia"), "AUS expands to australia");
});

// ── 3. Match Search Matching ─────────────────────────────────────────────────
test("matchMatchesSearch identifies matches via abbreviations and full names", () => {
  const mockMatch = {
    homeTeam: "Bangladesh",
    homeShort: "BAN",
    awayTeam: "India",
    awayShort: "IND",
    competition: "ICC Champions Trophy",
    sport: "cricket",
    status: "LIVE",
  };

  assert.equal(matchMatchesSearch(mockMatch, "BD"), true, "BD matches Bangladesh");
  assert.equal(matchMatchesSearch(mockMatch, "IND"), true, "IND matches India");
  assert.equal(matchMatchesSearch(mockMatch, "Champions"), true, "Champions matches competition");
  assert.equal(matchMatchesSearch(mockMatch, "Real Madrid"), false, "Unrelated team does not match");
});
