import test from "node:test";
import assert from "node:assert/strict";
import { getExpandedSearchTerms, getCompetitionPriority, matchMatchesSearch } from "../lib/aliases.js";

test("Alias expansion resolves BGD and BD to Bangladesh", () => {
  const bgdTerms = getExpandedSearchTerms("BGD");
  assert.ok(bgdTerms.includes("bangladesh"), "BGD must expand to bangladesh");

  const bdTerms = getExpandedSearchTerms("BD");
  assert.ok(bdTerms.includes("bangladesh"), "BD must expand to bangladesh");

  const banTerms = getExpandedSearchTerms("BAN");
  assert.ok(banTerms.includes("bangladesh"), "BAN must expand to bangladesh");
});

test("Alias expansion resolves HK and Sixes to Hong Kong Sixes", () => {
  const hkTerms = getExpandedSearchTerms("HK");
  assert.ok(hkTerms.includes("hong kong"), "HK must expand to hong kong");
  assert.ok(hkTerms.includes("hong kong sixes"), "HK must expand to hong kong sixes");

  const sixesTerms = getExpandedSearchTerms("sixes");
  assert.ok(sixesTerms.includes("hong kong sixes"), "sixes must expand to hong kong sixes");
});

test("Competition prioritization assigns high tier to Hong Kong Sixes", () => {
  const hkPriority = getCompetitionPriority("Hong Kong Sixes 2026", "cricket");
  const domesticPriority = getCompetitionPriority("Ranji Trophy", "cricket");
  assert.ok(hkPriority >= 100, "Hong Kong Sixes must receive tier 1 priority (>=100)");
  assert.ok(hkPriority > domesticPriority, "Hong Kong Sixes must rank higher than domestic matches");
});

test("Match search finds fixtures with expanded BGD alias", () => {
  const sampleMatch = {
    home: { name: "Bangladesh", short: "BAN" },
    away: { name: "Sri Lanka", short: "SL" },
    competition: "ICC T20 Series",
    sport: "cricket",
  };

  assert.equal(matchMatchesSearch(sampleMatch, "BGD"), true);
  assert.equal(matchMatchesSearch(sampleMatch, "BAN"), true);
  assert.equal(matchMatchesSearch(sampleMatch, "Tigers"), true);
});

test("Match search finds fixtures with expanded RMA and BARCA aliases", () => {
  const elClasico = {
    home: { name: "Real Madrid", short: "RMA" },
    away: { name: "Barcelona", short: "BAR" },
    competition: "La Liga",
    sport: "football",
  };

  assert.equal(matchMatchesSearch(elClasico, "RMA"), true);
  assert.equal(matchMatchesSearch(elClasico, "BARCA"), true);
  assert.equal(matchMatchesSearch(elClasico, "Los Blancos"), true);
});

test("Player alias expansion resolves CR7 and Ronaldo to Cristiano Ronaldo", () => {
  const cr7Terms = getExpandedSearchTerms("CR7");
  assert.ok(cr7Terms.includes("cristiano ronaldo"), "CR7 must expand to cristiano ronaldo");

  const ronaldoTerms = getExpandedSearchTerms("ronaldo");
  assert.ok(ronaldoTerms.includes("cristiano ronaldo"), "ronaldo must expand to cristiano ronaldo");
  assert.ok(ronaldoTerms.includes("cr7"), "ronaldo must include cr7");
});

test("Player alias expansion resolves Shakib Al Ha and Fizz to complete player identities", () => {
  const shakibTerms = getExpandedSearchTerms("shakib al ha");
  assert.ok(shakibTerms.includes("shakib al hasan"), "shakib al ha must expand to shakib al hasan");

  const fizzTerms = getExpandedSearchTerms("fizz");
  assert.ok(fizzTerms.includes("mustafizur rahman"), "fizz must expand to mustafizur rahman");
});
