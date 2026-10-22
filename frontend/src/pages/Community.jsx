import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, BarChart3, Plus, Radio, Calendar, CheckCircle2 } from "lucide-react";
import CommunityPost from "../components/community/CommunityPost.jsx";
import PollCard from "../components/community/PollCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const categories = [
  { id: "ALL", label: "All Discussions" },
  { id: "LIVE", label: "🔴 Live Matches" },
  { id: "UPCOMING", label: "Upcoming Predictions" },
  { id: "COMPLETED", label: "Completed Debates" },
  { id: "POLLS", label: "📊 Active Polls" },
];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [polls, setPolls] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [pollsLoading, setPollsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Post form state
  const [draft, setDraft] = useState("");
  const [matchTag, setMatchTag] = useState("");
  const [postCategory, setPostCategory] = useState("ALL");
  const [posting, setPosting] = useState(false);
  const [category, setCategory] = useState("ALL");

  // Fetch real posts
  const fetchPosts = async () => {
    setPostsLoading(true);
    setError(null);
    try {
      const params = { limit: 50 };
      if (category !== "ALL" && category !== "POLLS") {
        params.matchStatus = category;
      }
      const { data } = await api.get("/posts", { params });
      if (data.success) {
        setPosts(data.posts || []);
      } else {
        setError(data.message || "Failed to load posts");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Cannot connect to backend server. Make sure http://localhost:5000 is running."
      );
    } finally {
      setPostsLoading(false);
    }
  };

  // Fetch real polls
  const fetchPolls = async () => {
    setPollsLoading(true);
    try {
      const params = {};
      if (category !== "ALL" && category !== "POLLS") {
        params.matchStatus = category;
      }
      const { data } = await api.get("/polls", { params });
      if (data.success) {
        setPolls(data.polls || []);
      }
    } catch {
      // Polls non-critical
    } finally {
      setPollsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchPolls();
  }, [category]);

  const handlePost = async () => {
    if (!draft.trim() || !user) return;
    setPosting(true);
    try {
      const { data } = await api.post("/posts", {
        content: draft.trim(),
        matchTag: matchTag.trim() || null,
        matchStatus: postCategory,
      });
      if (data.success && data.post) {
        setPosts([data.post, ...posts]);
        setDraft("");
        setMatchTag("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit post. Please verify your login status.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="section-pad py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">Community</p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Fan Discussions & Polls</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Debate live games, post match predictions, analyze results, and vote in community polls.
        </p>
      </div>

      {/* Create post form */}
      <div className="glass p-5 rounded-xl border border-white/10">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!user || posting}
          rows={3}
          placeholder={user ? "What are your thoughts on today's football or cricket matches?" : "Log in to join the discussion, comment, and vote..."}
          className="input resize-none disabled:opacity-50 text-sm"
        />

        {user && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={matchTag}
              onChange={(e) => setMatchTag(e.target.value)}
              placeholder="Tag a match (e.g. Real Madrid vs Barcelona)"
              className="input !py-1.5 !px-3 text-xs w-full sm:w-64"
            />
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span>Category:</span>
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="rounded-lg border border-white/10 bg-midnight-900 px-2.5 py-1 text-xs text-ink"
              >
                <option value="ALL">General Discussion</option>
                <option value="LIVE">🔴 Live Match</option>
                <option value="UPCOMING">Upcoming Prediction</option>
                <option value="COMPLETED">Completed Debate</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <p className="text-[11px] text-ink-faint">
            {user ? (
              "Posts are persistently saved to MatchFusion database."
            ) : (
              <>
                <Link to="/login" className="text-broadcast font-medium hover:underline">Log in</Link> or{" "}
                <Link to="/register" className="text-broadcast font-medium hover:underline">Sign up</Link> to participate.
              </>
            )}
          </p>
          <button
            onClick={handlePost}
            disabled={!user || !draft.trim() || posting}
            className="btn-primary !px-5 !py-2 text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{posting ? "Posting…" : "Post Opinion"}</span>
          </button>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`chip transition ${category === c.id ? "chip-active" : "hover:border-white/20"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Feed layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main Feed */}
        <div className="space-y-4 lg:col-span-2">
          {postsLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-broadcast" />
              <span className="ml-3 text-sm text-ink-muted">Loading fan discussions…</span>
            </div>
          )}

          {!postsLoading && error && (
            <div className="glass border-alert/20 p-5">
              <p className="text-sm font-medium text-alert">⚠ Connection Issue</p>
              <p className="mt-1 text-xs text-ink-muted">{error}</p>
              <button onClick={fetchPosts} className="mt-3 text-xs text-broadcast hover:underline">
                Try again
              </button>
            </div>
          )}

          {!postsLoading && !error && category === "POLLS" && (
            <div className="space-y-4">
              {polls.map((p) => (
                <PollCard key={p.id} poll={p} />
              ))}
            </div>
          )}

          {!postsLoading && !error && category !== "POLLS" && posts.length === 0 && (
            <EmptyState
              title="No discussions in this category yet"
              subtitle="Share your prediction or reaction above to start the conversation!"
            />
          )}

          {!postsLoading && !error && category !== "POLLS" && posts.map((p) => (
            <CommunityPost key={p.id} post={p} />
          ))}
        </div>

        {/* Sidebar: Active Match Polls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <p className="eyebrow">📊 Active Match Polls</p>
            <span className="text-[11px] text-ink-faint">Live Voting</span>
          </div>

          {pollsLoading ? (
            <div className="glass p-6 text-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-intel mx-auto mb-2" />
              <p className="text-xs text-ink-muted">Loading polls…</p>
            </div>
          ) : polls.length > 0 ? (
            polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))
          ) : (
            <div className="glass p-5 text-center text-xs text-ink-muted">
              No active polls available right now.
            </div>
          )}

          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-xs text-ink-muted">
            <p className="font-semibold text-ink mb-1">Community Guidelines</p>
            <p className="text-ink-faint leading-relaxed">
              MatchFusion polls are connected to real football and cricket fixtures. Every registered fan gets one persistent vote per poll.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
