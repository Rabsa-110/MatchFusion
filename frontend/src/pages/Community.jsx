import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CommunityPost from "../components/community/CommunityPost.jsx";
import PollCard from "../components/community/PollCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { posts as initialPosts, polls } from "../data/mockCommunity.js";
import { useAuth } from "../context/AuthContext.jsx";

const tabs = [
  { id: "latest", label: "Latest" },
  { id: "popular", label: "Popular" },
  { id: "polls", label: "Polls" },
];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState("latest");

  const handlePost = () => {
    if (!draft.trim() || !user) return;
    const newPost = {
      id: `local-${Date.now()}`,
      user: user.name,
      initials: user.name.slice(0, 2).toUpperCase(),
      color: "#2E9BFF",
      time: "Just now",
      content: draft.trim(),
      matchTag: null,
      likes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
    setDraft("");
  };

  const visiblePosts = useMemo(() => {
    if (tab === "popular") return [...posts].sort((a, b) => b.likes - a.likes);
    return posts;
  }, [tab, posts]);

  return (
    <div className="section-pad py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">Community</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Fan discussions</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Post opinions, comment, react, and vote in match polls.</p>
      </div>

      {/* Create post */}
      <div className="glass p-4 sm:p-5">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!user}
          rows={3}
          placeholder={user ? "What's on your mind?" : "Log in to share your thoughts..."}
          className="input resize-none disabled:opacity-50"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] text-ink-faint">
            {user ? "Posting locally for this demo session." : (
              <>
                <Link to="/login" className="text-broadcast hover:underline">Log in</Link> to post, comment, and vote.
              </>
            )}
          </p>
          <button onClick={handlePost} disabled={!user || !draft.trim()} className="btn-primary !px-4 !py-2 text-xs disabled:opacity-40">
            Post
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`chip ${tab === t.id ? "chip-active" : "hover:border-white/20"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {tab === "polls" ? (
            <EmptyState title="Switch to the sidebar" subtitle="Active polls are shown on the right." />
          ) : visiblePosts.length === 0 ? (
            <EmptyState title="No posts yet" subtitle="Be the first to start a discussion." />
          ) : (
            visiblePosts.map((p) => <CommunityPost key={p.id} post={p} />)
          )}
        </div>

        <div className="space-y-4">
          <p className="eyebrow">📊 Active polls</p>
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      </div>
    </div>
  );
}
