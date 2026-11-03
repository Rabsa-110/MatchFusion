import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Calendar,
  MessageSquare,
  ThumbsUp,
  BarChart2,
  Trash2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    api
      .get("/auth/profile")
      .then(({ data }) => {
        if (data.success && data.profile) {
          setProfileData(data.profile);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile data");
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      setProfileData((prev) => ({
        ...prev,
        posts: prev.posts.filter((p) => p.id !== postId),
        _count: {
          ...prev._count,
          posts: Math.max(0, (prev._count?.posts || 1) - 1),
        },
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  if (!user) return null;

  return (
    <div className="section-pad py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">My Account</p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">User Profile</h1>
        <p className="mt-1 text-sm text-ink-muted">
          View your MatchFusion account information, security details, and community activity.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* User Card */}
        <div className="glass space-y-6 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-broadcast to-intel font-display text-2xl font-bold text-white shadow-xl">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">{user.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-live/15 px-2 py-0.5 text-[11px] font-semibold text-live">
                <ShieldCheck className="h-3 w-3" /> Verified Member
              </span>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/[0.08] pt-4 text-xs">
            <div className="flex items-center gap-2.5 text-ink-muted">
              <Mail className="h-4 w-4 text-ink-faint" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-ink-muted">
              <Calendar className="h-4 w-4 text-ink-faint" />
              <span>
                Joined{" "}
                {profileData?.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Recently"}
              </span>
            </div>
          </div>

          {/* Activity counters */}
          <div className="grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <p className="font-display text-xl font-bold text-ink">
                {profileData?._count?.posts ?? 0}
              </p>
              <p className="text-[11px] text-ink-muted">Posts Created</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <p className="font-display text-xl font-bold text-ink">
                {profileData?._count?.comments ?? 0}
              </p>
              <p className="text-[11px] text-ink-muted">Comments</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <p className="font-display text-xl font-bold text-ink">
                {profileData?._count?.reactions ?? 0}
              </p>
              <p className="text-[11px] text-ink-muted">Reactions</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <p className="font-display text-xl font-bold text-ink">
                {profileData?._count?.votes ?? 0}
              </p>
              <p className="text-[11px] text-ink-muted">Poll Votes</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full rounded-xl border border-alert/30 bg-alert/10 py-2.5 text-center text-xs font-semibold text-alert transition hover:bg-alert/20"
          >
            Sign Out
          </button>
        </div>

        {/* User Activity / Posts */}
        <div className="lg:col-span-2">
          <div className="glass space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">Recent Discussions</h3>
                <p className="text-xs text-ink-muted">Your posts shared in the MatchFusion community</p>
              </div>
              <Link
                to="/community"
                className="flex items-center gap-1 text-xs font-medium text-broadcast hover:underline"
              >
                Community feed <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-broadcast border-t-transparent" />
                <span className="ml-3 text-sm text-ink-muted">Loading your activity…</span>
              </div>
            )}

            {!loading && error && (
              <p className="rounded-lg bg-alert/10 p-3 text-xs text-alert">{error}</p>
            )}

            {!loading && !error && (!profileData?.posts || profileData.posts.length === 0) && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-ink-faint" />
                <p className="text-sm font-medium text-ink">No community posts yet</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Share your match predictions and analysis with international sports fans.
                </p>
                <Link
                  to="/community"
                  className="btn-primary mt-4 inline-flex !px-4 !py-2 text-xs"
                >
                  Create your first post
                </Link>
              </div>
            )}

            {!loading && profileData?.posts && profileData.posts.length > 0 && (
              <div className="space-y-3">
                {profileData.posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      {post.matchTag && (
                        <span className="inline-block rounded bg-broadcast/10 px-2 py-0.5 text-[10px] font-semibold text-broadcast">
                          {post.matchTag}
                        </span>
                      )}
                      <p className="text-sm text-ink">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-ink-faint">
                        <span>
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleDateString()
                            : "Recently"}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {post._count?.reactions || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {post._count?.comments || 0}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="flex items-center gap-1 self-start rounded-lg border border-alert/20 bg-alert/5 px-2.5 py-1 text-xs text-alert transition hover:bg-alert/15 sm:self-center"
                      title="Delete post"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
