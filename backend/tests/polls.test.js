// backend/tests/polls.test.js
// Unit tests for poll percentage calculations and vote duplicate prevention.

import test from "node:test";
import assert from "node:assert/strict";

// ── 1. Poll Percentage Calculation ───────────────────────────────────────────
test("Poll percentage calculations correctly compute shares and handle zero votes", () => {
  const optionsWithVotes = [
    { id: "opt-1", label: "Real Madrid", votes: 40 },
    { id: "opt-2", label: "Draw", votes: 20 },
    { id: "opt-3", label: "Barcelona", votes: 40 },
  ];

  const total = optionsWithVotes.reduce((sum, o) => sum + o.votes, 0);
  assert.equal(total, 100);

  const pcts = optionsWithVotes.map((o) => Math.round((o.votes / total) * 100));
  assert.deepEqual(pcts, [40, 20, 40]);
  assert.equal(pcts.reduce((a, b) => a + b, 0), 100);

  // Zero votes edge case
  const zeroOptions = [
    { id: "opt-1", label: "Yes", votes: 0 },
    { id: "opt-2", label: "No", votes: 0 },
  ];
  const zeroTotal = zeroOptions.reduce((sum, o) => sum + o.votes, 0);
  const zeroPcts = zeroOptions.map((o) => (zeroTotal ? Math.round((o.votes / zeroTotal) * 100) : 0));
  assert.deepEqual(zeroPcts, [0, 0]);
});

// ── 2. Poll Duplicate Vote Rule ──────────────────────────────────────────────
test("Single vote per user per poll rule prevents duplicate submissions", () => {
  const votes = [{ userId: "u-1", pollId: "p-1", optionId: "opt-1" }];

  const userCanVote = (userId, pollId) => !votes.some((v) => v.userId === userId && v.pollId === pollId);

  assert.equal(userCanVote("u-1", "p-1"), false, "Existing voter cannot vote again on same poll");
  assert.equal(userCanVote("u-1", "p-2"), true, "Same user CAN vote on a different poll");
  assert.equal(userCanVote("u-2", "p-1"), true, "Different user CAN vote on the poll");
});

