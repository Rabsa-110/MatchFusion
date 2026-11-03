import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, BarChart3, Plus, X } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("post"); // "post" | "poll"
  const [draft, setDraft] = useState("");
  const [matchTag, setMatchTag] = useState("");
  const [postCategory, setPostCategory] = useState("ALL");
  const [posting, setPosting] = useState(false);
  const [category, setCategory] = useState("ALL");

  // Poll form state
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollMatchTag, setPollMatchTag] = useState("");
  const [pollStatus, setPollStatus] = useState("ALL");
  const [creatingPoll, setCreatingPoll] = useState(false);

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
          "Unable to connect to MatchFusion server. Please try again."
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
      // Non-fatal
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
      alert(err.response?.data?.message || "Failed to submit post");
    } finally {
      setPosting(false);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!pollQuestion.trim() || !user) return;

    const validOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (validOpts.length < 2) {
      alert("Please provide at least 2 poll options.");
      return;
    }

    setCreatingPoll(true);
    try {
      const { data } = await api.post("/polls", {
        question: pollQuestion.trim(),
        options: validOpts,
        matchId: pollMatchTag.trim() || null,
        matchStatus: pollStatus,
      });

      if (data.success && data.poll) {
        setPolls([data.poll, ...polls]);
        setPollQuestion("");
        setPollOptions(["", ""]);
        setPollMatchTag("");
        setActiveTab("post");
        alert("Match poll created successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create poll");
    } finally {
      setCreatingPoll(false);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (idx) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="section-pad py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">Community</p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Fan Discussions & Polls
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Debate live games, post match predictions, analyze results, and vote in verified community polls.
        </p>
      </div>

      {/* Creation Box (Post / Poll) */}
      <div className="glass p-5 rounded-xl border border-white/10">
        <div className="mb-3 flex items-center gap-3 border-b border-white/[0.06] pb-3">
          <button
            onClick={() => setActiveTab("post")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
              activeTab === "post"
                ? "bg-broadcast text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Share Opinion
          </button>
          <button
            onClick={() => setActiveTab("poll")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
              activeTab === "poll"
                ? "bg-broadcast text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Create Match Poll
          </button>
        </div>

        {activeTab === "post" ? (
          <div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!user || posting}
              rows={3}
              placeholder={
                user
                  ? "What are your thoughts on today's football or cricket matches?"
                  : "Sign in to join the discussion, comment, and vote in match polls..."
              }
              className="input resize-none disabled:opacity-50 text-sm"
            />

            {user && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={matchTag}
                  onChange={(e) => setMatchTag(e.target.value)}
                  placeholder="Tag a match (e.g. Bangladesh vs India or Real Madrid vs Barcelona)"
                  className="input !py-1.5 !px-3 text-xs w-full sm:w-80"
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
                  "Saved persistently to PostgreSQL database."
                ) : (
                  <>
                    <Link to="/login" className="text-broadcast font-medium hover:underline">
                      Log in
                    </Link>{" "}
                    or{" "}
                    <Link to="/register" className="text-broadcast font-medium hover:underline">
                      Sign up
                    </Link>{" "}
                    to participate.
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
        ) : (
          <form onSubmit={handleCreatePoll} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Poll Question
              </label>
              <input
                type="text"
                required
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="e.g. Who will score next in tonight's Champions League match?"
                className="input !py-1.5 !px-3 text-xs"
                disabled={!user || creatingPoll}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-ink-muted">
                Options (2 to 4 options)
              </label>
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[i] = e.target.value;
                      setPollOptions(updated);
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="input !py-1.5 !px-3 text-xs flex-1"
                    disabled={!user || creatingPoll}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePollOption(i)}
                      className="text-ink-faint hover:text-alert p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={addPollOption}
                  className="text-xs text-broadcast hover:underline flex items-center gap-1 pt-1"
                >
                  <Plus className="h-3 w-3" /> Add another option
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <input
                type="text"
                value={pollMatchTag}
                onChange={(e) => setPollMatchTag(e.target.value)}
                placeholder="Linked Match (optional)"
                className="input !py-1.5 !px-3 text-xs w-full sm:w-64"
                disabled={!user || creatingPoll}
              />
              <select
                value={pollStatus}
                onChange={(e) => setPollStatus(e.target.value)}
                className="rounded-lg border border-white/10 bg-midnight-900 px-2.5 py-1 text-xs text-ink"
                disabled={!user || creatingPoll}
              >
                <option value="ALL">All Categories</option>
                <option value="LIVE">🔴 Live Match Poll</option>
                <option value="UPCOMING">Upcoming Fixture Poll</option>
                <option value="COMPLETED">Completed Debrief</option>
              </select>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <p className="text-[11px] text-ink-faint">
                {user ? "Every user gets exactly one vote per poll." : "Log in to create polls."}
              </p>
              <button
                type="submit"
                disabled={!user || !pollQuestion.trim() || creatingPoll}
                className="btn-primary !px-5 !py-2 text-xs flex items-center gap-1.5 disabled:opacity-40"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>{creatingPoll ? "Creating…" : "Publish Poll"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Categories Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`chip transition ${
              category === c.id ? "chip-active" : "hover:border-white/20"
            }`}
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
              {polls.length > 0 ? (
                polls.map((p) => <PollCard key={p.id} poll={p} />)
              ) : (
                <EmptyState
                  title="No polls in this category"
                  subtitle="Use the Create Match Poll button above to publish the first one!"
                />
              )}
            </div>
          )}

          {!postsLoading && !error && category !== "POLLS" && posts.length === 0 && (
            <EmptyState
              title="No discussions in this category yet"
              subtitle="Share your prediction or reaction above to start the conversation!"
            />
          )}

          {!postsLoading &&
            !error &&
            category !== "POLLS" &&
            posts.map((p) => (
              <CommunityPost
                key={p.id}
                post={p}
                onDelete={(deletedId) =>
                  setPosts((prev) => prev.filter((item) => item.id !== deletedId))
                }
              />
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
            polls.map((poll) => <PollCard key={poll.id} poll={poll} />)
          ) : (
            <div className="glass p-5 text-center text-xs text-ink-muted">
              No active polls available right now. Click "Create Match Poll" to launch one!
            </div>
          )}

          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-xs text-ink-muted">
            <p className="font-semibold text-ink mb-1">Community Guidelines</p>
            <p className="text-ink-faint leading-relaxed">
              MatchFusion polls are connected to real football and cricket fixtures. Every registered fan gets one persistent vote per poll stored in Supabase PostgreSQL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
