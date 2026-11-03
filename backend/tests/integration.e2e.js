// backend/tests/integration.e2e.js
// Live end-to-end integration test against the real Supabase database.

import test from "node:test";
import assert from "node:assert/strict";
import prisma from "../lib/prisma.js";
import {
  findUserByEmail,
  createUser,
  createPost,
  togglePostReaction,
  createComment,
  createPollInDb,
  votePoll,
  getUserProfileData,
  deletePost,
} from "../lib/db.js";

const TEST_EMAIL = `test_${Date.now()}@matchfusion.test`;

test("E2E Database Persistence: Register, Post, React, Comment, Poll, Vote, Profile", async () => {
  // 1. Database connectivity
  const count = await prisma.match.count();
  assert.ok(count > 0, "Real matches exist in Supabase database");

  // 2. User registration
  const user = await createUser({
    name: "Automated QA Fan",
    email: TEST_EMAIL,
    passwordHash: "$2a$10$e8w...dummyhash",
  });
  assert.ok(user.id, "User created with cuid in PostgreSQL");
  assert.equal(user.email, TEST_EMAIL.toLowerCase());

  // 3. User query
  const found = await findUserByEmail(TEST_EMAIL);
  assert.ok(found, "User can be queried from database");
  assert.equal(found.id, user.id);

  // 4. Create Post
  const { post } = await createPost({
    content: "Real live match test discussion by QA",
    matchTag: "Bangladesh vs India",
    matchStatus: "LIVE",
    authorId: user.id,
    authorName: user.name,
  });
  assert.ok(post.id, "Post persisted with DB id");

  // 5. Toggle reaction
  const reactionResult = await togglePostReaction({
    userId: user.id,
    postId: post.id,
    type: "like",
  });
  assert.equal(reactionResult.liked, true, "First reaction is true");
  assert.equal(reactionResult.likes, 1, "Likes count incremented");

  // 6. Create comment
  const comment = await createComment({
    postId: post.id,
    authorId: user.id,
    authorName: user.name,
    content: "Great bowling in the death overs!",
  });
  assert.ok(comment.id, "Comment persisted with DB id");

  // 7. Create Poll
  const poll = await createPollInDb({
    question: "Who will win the ICC Champions Trophy fixture?",
    options: ["Team 1", "Team 2"],
    matchStatus: "LIVE",
    creatorId: user.id,
  });
  assert.ok(poll.id, "Poll persisted with DB id");
  assert.equal(poll.options.length, 2);

  // 8. Vote in Poll
  const voteRes = await votePoll({
    pollId: poll.id,
    optionId: poll.options[0].id,
    userId: user.id,
  });
  assert.equal(voteRes.success, true, "Vote successfully recorded");

  // 9. Prevent Duplicate Voting
  const duplicateVoteRes = await votePoll({
    pollId: poll.id,
    optionId: poll.options[1].id,
    userId: user.id,
  });
  assert.equal(duplicateVoteRes.success, false, "Duplicate vote rejected");
  assert.match(duplicateVoteRes.message, /already voted/i);

  // 10. User Profile & Activity
  const profile = await getUserProfileData(user.id);
  assert.equal(profile.id, user.id);
  assert.equal(profile._count.posts, 1);
  assert.equal(profile._count.comments, 1);
  assert.equal(profile._count.reactions, 1);
  assert.equal(profile._count.votes, 1);

  // 11. Cleanup QA test records safely
  await deletePost({ postId: post.id, authorId: user.id });
  await prisma.poll.delete({ where: { id: poll.id } }).catch(() => {});
  await prisma.user.delete({ where: { id: user.id } }).catch(() => {});

  console.log("✓ Full E2E database persistence workflow verified against live Supabase PostgreSQL!");
});

