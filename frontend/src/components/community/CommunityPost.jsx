import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function CommunityPost({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikes((v) => (liked ? v - 1 : v + 1));
  };

  return (
    <article className="glass card-sheen p-5">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: post.color }}
        >
          {post.initials}
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">{post.user}</p>
          <p className="text-[11px] text-ink-faint">{post.time}</p>
        </div>
      </div>

      <p className="mt-3.5 text-sm leading-relaxed text-ink-muted">{post.content}</p>

      {post.matchTag && <span className="chip mt-3 w-fit !py-0.5 text-[11px]">🔗 {post.matchTag}</span>}

      <div className="mt-4 flex items-center gap-5 border-t border-white/[0.06] pt-3.5 text-xs text-ink-faint">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 transition ${liked ? "text-alert" : "hover:text-ink-muted"}`}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? "fill-alert" : ""}`} /> {likes}
        </button>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5" /> {post.comments}
        </span>
        <span className="flex items-center gap-1.5">
          <Share2 className="h-3.5 w-3.5" /> Share
        </span>
      </div>
    </article>
  );
}
