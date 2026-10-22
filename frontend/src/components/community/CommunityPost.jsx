import { useState } from "react";
import { Heart, MessageCircle, Share2, Send, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

export default function CommunityPost({ post }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(
    user && post.reactions ? post.reactions.some((r) => r.userId === user.id) : false
  );
  const [likes, setLikes] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || (post.comments?.length || 0));
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleLike = async () => {
    if (!user) {
      alert("Please log in to react to posts.");
      return;
    }

    // Optimistic UI update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes((v) => (nextLiked ? v + 1 : Math.max(0, v - 1)));

    try {
      const { data } = await api.post(`/posts/${post.id}/react`);
      if (data.success) {
        setLiked(data.liked);
        if (typeof data.likes === "number") setLikes(data.likes);
      }
    } catch {
      // Revert on error
      setLiked(!nextLiked);
      setLikes((v) => (!nextLiked ? v + 1 : Math.max(0, v - 1)));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || submittingComment) return;

    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, {
        content: newComment.trim(),
      });
      if (data.success && data.comment) {
        setComments([...comments, data.comment]);
        setCommentsCount((c) => c + 1);
        setNewComment("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/community#post-${post.id}`;
    const shareData = {
      title: "MatchFusion Discussion",
      text: `${post.user}: "${post.content.slice(0, 80)}..."`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Link copied: " + shareUrl);
    }
  };

  return (
    <article id={`post-${post.id}`} className="glass card-sheen p-5 transition hover:border-white/15">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: post.color || "#2E9BFF" }}
          >
            {post.initials}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{post.user}</p>
            <p className="text-[11px] text-ink-faint">{post.time}</p>
          </div>
        </div>
        {post.matchStatus && post.matchStatus !== "ALL" && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              post.matchStatus === "LIVE"
                ? "bg-live/15 text-live"
                : post.matchStatus === "UPCOMING"
                ? "bg-intel/15 text-intel"
                : "bg-broadcast/15 text-broadcast"
            }`}
          >
            {post.matchStatus}
          </span>
        )}
      </div>

      <p className="mt-3.5 text-sm leading-relaxed text-ink-muted">{post.content}</p>

      {post.matchTag && (
        <span className="chip mt-3 w-fit !py-0.5 text-[11px] text-intel border-intel/20">
          🔗 {post.matchTag}
        </span>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-6 border-t border-white/[0.06] pt-3.5 text-xs text-ink-faint">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 transition ${
            liked ? "text-alert font-medium" : "hover:text-ink-muted"
          }`}
          title={user ? "React with Like" : "Log in to like"}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? "fill-alert" : ""}`} /> {likes}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1.5 transition ${
            showComments ? "text-broadcast font-medium" : "hover:text-ink-muted"
          }`}
        >
          <MessageCircle className="h-3.5 w-3.5" /> {commentsCount}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 transition hover:text-ink-muted"
          title="Share post"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-live" />
              <span className="text-live">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-3">
          {comments.length > 0 ? (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-white/[0.03] p-3 border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-ink">{c.user}</span>
                    <span className="text-ink-faint">{c.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-faint text-center py-2">
              No comments yet. Be the first to reply!
            </p>
          )}

          {/* Add comment form */}
          {user ? (
            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="input !py-1.5 !px-3 text-xs flex-1"
                disabled={submittingComment}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1 disabled:opacity-40"
              >
                <Send className="h-3 w-3" />
                <span>Reply</span>
              </button>
            </form>
          ) : (
            <p className="text-[11px] text-ink-faint text-center pt-1">
              <a href="/login" className="text-broadcast hover:underline">Log in</a> to leave a comment.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
