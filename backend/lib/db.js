// backend/lib/db.js
// Universal Database Layer for MatchFusion.
//
// Dual-mode architecture:
// 1. PostgreSQL via Prisma Client (Primary): Live Supabase PostgreSQL instance.
// 2. Persistent Local Storage (Fallback): ONLY enabled in development when explicitly
//    configured via DB_FALLBACK_ENABLED=true. In production, this fallback is STRICTLY DISABLED
//    to ensure data integrity.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");
const LOCAL_DB_FILE = path.join(DATA_DIR, "localDatabase.json");

// Local JSON fallback is strictly disabled in production
export const FALLBACK_ENABLED =
  process.env.NODE_ENV !== "production" &&
  process.env.DB_FALLBACK_ENABLED === "true";

function isPlaceholderUrl(url) {
  if (!url) return true;
  return (
    url.includes("HOST:5432") ||
    url.includes("USER:PASSWORD") ||
    url.includes("placeholder")
  );
}

let prismaActive = !isPlaceholderUrl(process.env.DATABASE_URL);

const INITIAL_SEED = {
  users: [],
  posts: [],
  reactions: [],
  comments: [],
  polls: [],
  votes: [],
  matches: [],
};

function loadLocalDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_DB_FILE)) {
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(INITIAL_SEED, null, 2), "utf8");
      return INITIAL_SEED;
    }
    const raw = fs.readFileSync(LOCAL_DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[db] error reading local database file:", err.message);
    return INITIAL_SEED;
  }
}

function saveLocalDb(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("[db] error writing local database:", err.message);
  }
}

// ── User Operations ──────────────────────────────────────────────────────────

export async function findUserByEmail(email) {
  if (prismaActive) {
    try {
      return await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      console.warn("[db] PostgreSQL unreachable, falling back to local store:", e.message);
      prismaActive = false;
    }
  }
  if (!FALLBACK_ENABLED) {
    throw new Error("Database connection is not configured or currently unreachable.");
  }
  const db = loadLocalDb();
  return (db.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  if (prismaActive) {
    try {
      return await prisma.user.findUnique({ where: { id } });
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      prismaActive = false;
    }
  }
  if (!FALLBACK_ENABLED) {
    throw new Error("Database connection is not configured or currently unreachable.");
  }
  const db = loadLocalDb();
  return (db.users || []).find((u) => u.id === id) || null;
}

export async function createUser({ name, email, passwordHash }) {
  if (prismaActive) {
    try {
      return await prisma.user.create({
        data: { name: name.trim(), email: email.toLowerCase().trim(), passwordHash },
      });
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      console.warn("[db] PostgreSQL create user failed, falling back to local store:", e.message);
      prismaActive = false;
    }
  }
  if (!FALLBACK_ENABLED) {
    throw new Error("Database error: cannot register user without persistent database connectivity.");
  }
  const db = loadLocalDb();
  const newUser = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  if (!db.users) db.users = [];
  db.users.push(newUser);
  saveLocalDb(db);
  return newUser;
}

export async function getUserProfileData(userId) {
  if (prismaActive) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              reactions: true,
              votes: true,
            },
          },
          posts: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              _count: { select: { comments: true, reactions: true } },
            },
          },
        },
      });
      return user;
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
    }
  }
  const db = loadLocalDb();
  const user = (db.users || []).find((u) => u.id === userId);
  if (!user) return null;
  const userPosts = (db.posts || []).filter((p) => p.authorId === userId);
  const userComments = (db.comments || []).filter((c) => c.authorId === userId);
  const userReactions = (db.reactions || []).filter((r) => r.userId === userId);
  const userVotes = (db.votes || []).filter((v) => v.userId === userId);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    _count: {
      posts: userPosts.length,
      comments: userComments.length,
      reactions: userReactions.length,
      votes: userVotes.length,
    },
    posts: userPosts.slice(0, 10).map((p) => ({
      id: p.id,
      content: p.content,
      createdAt: p.createdAt,
      matchTag: p.matchTag,
      _count: {
        comments: (db.comments || []).filter((c) => c.postId === p.id).length,
        reactions: p.likes || 0,
      },
    })),
  };
}

// ── Post Operations ──────────────────────────────────────────────────────────

export async function getPosts({ limit = 30, offset = 0, matchStatus, matchTag } = {}) {
  if (prismaActive) {
    try {
      const where = {};
      if (matchStatus && matchStatus !== "ALL" && matchStatus !== "all") {
        where.matchStatus = matchStatus.toUpperCase();
      }
      if (matchTag) {
        where.matchTag = { contains: matchTag, mode: "insensitive" };
      }

      const posts = await prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          reactions: { select: { id: true, type: true, userId: true } },
          comments: {
            include: { author: { select: { id: true, name: true } } },
            orderBy: { createdAt: "asc" },
          },
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      return {
        posts: posts.map((p) => ({
          id: p.id,
          user: p.author?.name || "Fan",
          authorId: p.author?.id,
          initials: (p.author?.name || "MF").slice(0, 2).toUpperCase(),
          color: stringToColor(p.author?.name || "MF"),
          time: timeAgo(p.createdAt),
          content: p.content,
          matchTag: p.matchTag,
          matchStatus: p.matchStatus || "ALL",
          likes: p._count?.reactions || 0,
          reactions: p.reactions || [],
          commentsCount: p._count?.comments || 0,
          comments: (p.comments || []).map((c) => ({
            id: c.id,
            content: c.content,
            authorId: c.author?.id,
            user: c.author?.name || "Fan",
            time: timeAgo(c.createdAt),
            createdAt: c.createdAt.toISOString(),
          })),
          createdAt: p.createdAt.toISOString(),
        })),
        storage: "postgresql",
      };
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      console.warn("[db] PostgreSQL load posts failed:", e.message);
      prismaActive = false;
    }
  }

  if (!FALLBACK_ENABLED) {
    throw new Error("Database connection is not configured or currently unreachable.");
  }

  const db = loadLocalDb();
  let list = db.posts || [];
  if (matchStatus && matchStatus !== "ALL" && matchStatus !== "all") {
    const upper = matchStatus.toUpperCase();
    list = list.filter((p) => (p.matchStatus || "ALL") === upper);
  }
  if (matchTag) {
    list = list.filter((p) => (p.matchTag || "").toLowerCase().includes(matchTag.toLowerCase()));
  }

  const sorted = [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sliced = sorted.slice(offset, offset + limit);

  return {
    posts: sliced.map((p) => ({
      id: p.id,
      user: p.authorName || "Fan",
      authorId: p.authorId,
      initials: (p.authorName || "MF").slice(0, 2).toUpperCase(),
      color: stringToColor(p.authorName || "MF"),
      time: timeAgo(p.createdAt),
      content: p.content,
      matchTag: p.matchTag,
      matchStatus: p.matchStatus || "ALL",
      likes: p.likes || 0,
      reactions: (db.reactions || []).filter((r) => r.postId === p.id),
      commentsCount: (db.comments || []).filter((c) => c.postId === p.id).length,
      comments: (db.comments || [])
        .filter((c) => c.postId === p.id)
        .map((c) => ({
          id: c.id,
          content: c.content,
          authorId: c.authorId,
          user: c.authorName || "Fan",
          time: timeAgo(c.createdAt),
          createdAt: c.createdAt,
        })),
      createdAt: p.createdAt,
    })),
    storage: "local_persistent",
  };
}

export async function createPost({ content, matchTag, matchStatus = "ALL", authorId, authorName }) {
  if (prismaActive) {
    try {
      const post = await prisma.post.create({
        data: {
          content: content.trim(),
          matchTag: matchTag?.trim() || null,
          matchStatus: matchStatus?.toUpperCase() || "ALL",
          authorId,
        },
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { comments: true, reactions: true } },
        },
      });

      return {
        post: {
          id: post.id,
          user: post.author.name,
          authorId: post.author.id,
          initials: post.author.name.slice(0, 2).toUpperCase(),
          color: stringToColor(post.author.name),
          time: "Just now",
          content: post.content,
          matchTag: post.matchTag,
          matchStatus: post.matchStatus,
          likes: 0,
          reactions: [],
          commentsCount: 0,
          comments: [],
          createdAt: post.createdAt.toISOString(),
        },
        storage: "postgresql",
      };
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      console.warn("[db] PostgreSQL create post failed:", e.message);
      prismaActive = false;
    }
  }

  if (!FALLBACK_ENABLED) {
    throw new Error("Database error: cannot create post without persistent database connectivity.");
  }

  const db = loadLocalDb();
  if (!db.posts) db.posts = [];
  const newPost = {
    id: `p-${Date.now()}`,
    content: content.trim(),
    matchTag: matchTag?.trim() || null,
    matchStatus: matchStatus?.toUpperCase() || "ALL",
    authorId,
    authorName: authorName || "Fan",
    createdAt: new Date().toISOString(),
    likes: 0,
    commentsCount: 0,
  };
  db.posts.unshift(newPost);
  saveLocalDb(db);

  return {
    post: {
      id: newPost.id,
      user: newPost.authorName,
      authorId: newPost.authorId,
      initials: newPost.authorName.slice(0, 2).toUpperCase(),
      color: stringToColor(newPost.authorName),
      time: "Just now",
      content: newPost.content,
      matchTag: newPost.matchTag,
      matchStatus: newPost.matchStatus,
      likes: 0,
      reactions: [],
      commentsCount: 0,
      comments: [],
      createdAt: newPost.createdAt,
    },
    storage: "local_persistent",
  };
}

export async function updatePost({ postId, authorId, content }) {
  if (prismaActive) {
    try {
      const existing = await prisma.post.findUnique({ where: { id: postId } });
      if (!existing) return { notFound: true };
      if (existing.authorId !== authorId) return { unauthorized: true };

      const updated = await prisma.post.update({
        where: { id: postId },
        data: { content: content.trim() },
        include: { author: { select: { id: true, name: true } } },
      });
      return { success: true, post: updated };
    } catch (e) {
      if (!FALLBACK_ENABLED) throw e;
    }
  }

  const db = loadLocalDb();
  const post = (db.posts || []).find((p) => p.id === postId);
  if (!post) return { notFound: true };
  if (post.authorId !== authorId) return { unauthorized: true };
  post.content = content.trim();
  saveLocalDb(db);
  return { success: true, post };
}

export async function deletePost({ postId, authorId }) {
  if (prismaActive) {
    try {
      const existing = await prisma.post.findUnique({ where: { id: postId } });
      if (!existing) return { notFound: true };
      if (existing.authorId !== authorId) return { unauthorized: true };

      await prisma.post.delete({ where: { id: postId } });
      return { success: true };
    } catch (e) {
      if (!FALLBACK_ENABLED) throw e;
    }
  }

  const db = loadLocalDb();
  const idx = (db.posts || []).findIndex((p) => p.id === postId);
  if (idx < 0) return { notFound: true };
  if (db.posts[idx].authorId !== authorId) return { unauthorized: true };
  db.posts.splice(idx, 1);
  saveLocalDb(db);
  return { success: true };
}

export async function togglePostReaction({ userId, postId, type = "like" }) {
  if (prismaActive) {
    try {
      const existing = await prisma.reaction.findUnique({
        where: { userId_postId_type: { userId, postId, type } },
      });
      if (existing) {
        await prisma.reaction.delete({ where: { id: existing.id } });
        const count = await prisma.reaction.count({ where: { postId } });
        return { liked: false, likes: count };
      } else {
        await prisma.reaction.create({ data: { userId, postId, type } });
        const count = await prisma.reaction.count({ where: { postId } });
        return { liked: true, likes: count };
      }
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      prismaActive = false;
    }
  }

  if (!FALLBACK_ENABLED) {
    throw new Error("Database error: cannot toggle reaction without database connectivity.");
  }

  const db = loadLocalDb();
  if (!db.reactions) db.reactions = [];
  const post = (db.posts || []).find((p) => p.id === postId);
  const existingIdx = db.reactions.findIndex(
    (r) => r.userId === userId && r.postId === postId && r.type === type
  );

  let liked = false;
  if (existingIdx >= 0) {
    db.reactions.splice(existingIdx, 1);
    if (post && post.likes > 0) post.likes -= 1;
    liked = false;
  } else {
    db.reactions.push({ userId, postId, type, createdAt: new Date().toISOString() });
    if (post) post.likes = (post.likes || 0) + 1;
    liked = true;
  }
  saveLocalDb(db);
  return { liked, likes: post ? post.likes : 0 };
}

// ── Comment Operations ───────────────────────────────────────────────────────

export async function getComments(postId) {
  if (prismaActive) {
    try {
      const comments = await prisma.comment.findMany({
        where: { postId },
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      });
      return comments.map((c) => ({
        id: c.id,
        postId: c.postId,
        content: c.content,
        authorId: c.author?.id,
        user: c.author?.name || "Fan",
        time: timeAgo(c.createdAt),
        createdAt: c.createdAt.toISOString(),
      }));
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      prismaActive = false;
    }
  }

  if (!FALLBACK_ENABLED) {
    throw new Error("Database error: cannot load comments without database connectivity.");
  }

  const db = loadLocalDb();
  return (db.comments || [])
    .filter((c) => c.postId === postId)
    .map((c) => ({
      id: c.id,
      postId: c.postId,
      content: c.content,
      authorId: c.authorId,
      user: c.authorName || "Fan",
      time: timeAgo(c.createdAt),
      createdAt: c.createdAt,
    }));
}

export async function createComment({ postId, authorId, authorName, content }) {
  if (prismaActive) {
    try {
      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          postId,
          authorId,
        },
        include: { author: { select: { id: true, name: true } } },
      });
      return {
        id: comment.id,
        postId: comment.postId,
        content: comment.content,
        authorId: comment.author?.id,
        user: comment.author?.name || authorName,
        time: "Just now",
        createdAt: comment.createdAt.toISOString(),
      };
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      prismaActive = false;
    }
  }

  if (!FALLBACK_ENABLED) {
    throw new Error("Database error: cannot post comment without database connectivity.");
  }

  const db = loadLocalDb();
  if (!db.comments) db.comments = [];
  const newComment = {
    id: `c-${Date.now()}`,
    postId,
    content: content.trim(),
    authorId,
    authorName: authorName || "Fan",
    createdAt: new Date().toISOString(),
  };
  db.comments.push(newComment);
  saveLocalDb(db);
  return {
    id: newComment.id,
    postId: newComment.postId,
    content: newComment.content,
    authorId: newComment.authorId,
    user: newComment.authorName,
    time: "Just now",
    createdAt: newComment.createdAt,
  };
}

export async function deleteComment({ commentId, authorId }) {
  if (prismaActive) {
    try {
      const existing = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!existing) return { notFound: true };
      if (existing.authorId !== authorId) return { unauthorized: true };

      await prisma.comment.delete({ where: { id: commentId } });
      return { success: true };
    } catch (e) {
      if (!FALLBACK_ENABLED) throw e;
    }
  }

  const db = loadLocalDb();
  const idx = (db.comments || []).findIndex((c) => c.id === commentId);
  if (idx < 0) return { notFound: true };
  if (db.comments[idx].authorId !== authorId) return { unauthorized: true };
  db.comments.splice(idx, 1);
  saveLocalDb(db);
  return { success: true };
}

// ── Poll Operations ──────────────────────────────────────────────────────────

export async function getPolls(matchStatus = null, currentUserId = null) {
  if (prismaActive) {
    try {
      const where = {};
      if (matchStatus && matchStatus !== "ALL" && matchStatus !== "all") {
        where.matchStatus = matchStatus.toUpperCase();
      }

      const polls = await prisma.poll.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true } },
          options: {
            include: {
              votes: true,
              _count: { select: { votes: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return polls.map((p) => {
        let userVotedOptionId = null;
        let totalVotes = 0;
        const options = p.options.map((opt) => {
          const voteCount = opt._count?.votes || opt.votes?.length || 0;
          totalVotes += voteCount;
          if (currentUserId && opt.votes?.some((v) => v.userId === currentUserId)) {
            userVotedOptionId = opt.id;
          }
          return {
            id: opt.id,
            label: opt.label,
            votes: voteCount,
          };
        });

        return {
          id: p.id,
          question: p.question,
          matchStatus: p.matchStatus || "ALL",
          matchId: p.matchId,
          creatorName: p.creator?.name || "MatchFusion",
          creatorId: p.creatorId,
          totalVotes,
          userVotedOptionId,
          options,
          createdAt: p.createdAt.toISOString(),
        };
      });
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      console.warn("[db] PostgreSQL get polls failed:", e.message);
      prismaActive = false;
    }
  }

  if (!FALLBACK_ENABLED) {
    throw new Error("Database connection is not configured or currently unreachable.");
  }

  const db = loadLocalDb();
  let list = db.polls || [];
  if (matchStatus && matchStatus !== "ALL" && matchStatus !== "all") {
    const upper = matchStatus.toUpperCase();
    list = list.filter((p) => p.matchStatus === upper);
  }

  return list.map((p) => {
    let userVotedOptionId = null;
    let totalVotes = 0;
    const options = (p.options || []).map((opt) => {
      totalVotes += opt.votes || 0;
      if (currentUserId && (db.votes || []).some((v) => v.userId === currentUserId && v.optionId === opt.id)) {
        userVotedOptionId = opt.id;
      }
      return opt;
    });
    return {
      ...p,
      totalVotes,
      userVotedOptionId,
      options,
    };
  });
}

export async function createPollInDb({ question, options, matchId, matchStatus = "ALL", creatorId }) {
  if (prismaActive) {
    try {
      const poll = await prisma.poll.create({
        data: {
          question: question.trim(),
          matchStatus: matchStatus.toUpperCase(),
          matchId: matchId || null,
          creatorId: creatorId || null,
          options: {
            create: options.map((label) => ({ label: label.trim() })),
          },
        },
        include: {
          creator: { select: { id: true, name: true } },
          options: true,
        },
      });

      return {
        id: poll.id,
        question: poll.question,
        matchStatus: poll.matchStatus,
        matchId: poll.matchId,
        creatorName: poll.creator?.name || "Fan",
        creatorId: poll.creatorId,
        totalVotes: 0,
        userVotedOptionId: null,
        options: poll.options.map((o) => ({ id: o.id, label: o.label, votes: 0 })),
        createdAt: poll.createdAt.toISOString(),
      };
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      prismaActive = false;
    }
  }

  if (!FALLBACK_ENABLED) {
    throw new Error("Database error: cannot create poll without database connectivity.");
  }

  const db = loadLocalDb();
  if (!db.polls) db.polls = [];
  const pollId = `poll-${Date.now()}`;
  const newPoll = {
    id: pollId,
    question: question.trim(),
    matchStatus: matchStatus.toUpperCase(),
    matchId: matchId || null,
    creatorId,
    totalVotes: 0,
    userVotedOptionId: null,
    options: options.map((label, idx) => ({ id: `opt-${pollId}-${idx}`, label: label.trim(), votes: 0 })),
    createdAt: new Date().toISOString(),
  };
  db.polls.unshift(newPoll);
  saveLocalDb(db);
  return newPoll;
}

export async function votePoll({ pollId, optionId, userId }) {
  if (prismaActive) {
    try {
      // Use interactive transaction to guarantee single vote per user per poll
      return await prisma.$transaction(async (tx) => {
        // 1. Check if user already voted on ANY option in this poll
        const existingVote = await tx.vote.findFirst({
          where: {
            userId,
            OR: [
              { pollId },
              { option: { pollId } },
            ],
          },
        });

        if (existingVote) {
          return { success: false, message: "You have already voted on this poll" };
        }

        // 2. Verify the option belongs to this poll
        const option = await tx.pollOption.findFirst({
          where: { id: optionId, pollId },
        });

        if (!option) {
          return { success: false, message: "Invalid option for this poll" };
        }

        // 3. Create the vote record
        await tx.vote.create({
          data: {
            userId,
            optionId,
            pollId,
          },
        });

        return { success: true, message: "Vote registered successfully" };
      });
    } catch (e) {
      if (!FALLBACK_ENABLED) {
        throw new Error("Database unavailable: " + e.message);
      }
      console.warn("[db] PostgreSQL vote poll failed:", e.message);
      prismaActive = false;
    }
  }

  if (!FALLBACK_ENABLED) {
    throw new Error("Database error: cannot register vote without database connectivity.");
  }

  const db = loadLocalDb();
  if (!db.votes) db.votes = [];
  const alreadyVoted = db.votes.some(
    (v) => v.userId === userId && v.pollId === pollId
  );
  if (alreadyVoted) {
    return { success: false, message: "You have already voted on this poll" };
  }

  db.votes.push({ userId, pollId, optionId, createdAt: new Date().toISOString() });
  const poll = (db.polls || []).find((p) => p.id === pollId);
  if (poll) {
    const opt = (poll.options || []).find((o) => o.id === optionId);
    if (opt) opt.votes = (opt.votes || 0) + 1;
  }
  saveLocalDb(db);
  return { success: true, message: "Vote registered" };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function stringToColor(str) {
  const colors = ["#2E9BFF", "#9B7CFF", "#1FE99C", "#FF4D5E", "#FFA53D", "#00D4B3"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
