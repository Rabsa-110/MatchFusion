const fs = require('fs');
const path = require('path');

const matchDetailsPath = path.resolve('frontend/src/pages/MatchDetails.jsx');
let code = fs.readFileSync(matchDetailsPath, 'utf8');

// 1. Add imports
if (!code.includes('useAuth')) {
  code = code.replace(
    'import { useParams, Link } from "react-router-dom";',
    'import { useParams, Link, useLocation } from "react-router-dom";\nimport { useAuth } from "../context/AuthContext.jsx";\nimport { MessageSquare, Send } from "lucide-react";'
  );
}

// 2. Add state & handlers
const stateInsertionTarget = 'const [tab, setTab] = useState("overview");';
const newStateCode = `const [tab, setTab] = useState("overview");
  const { user } = useAuth();
  const location = useLocation();
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [discussionPosts, setDiscussionPosts] = useState([]);
  const [loadingDiscussion, setLoadingDiscussion] = useState(false);

  const fetchMatchPosts = useCallback(async () => {
    if (!id) return;
    setLoadingDiscussion(true);
    try {
      const { data } = await api.get("/posts", {
        params: {
          matchTag: id,
          limit: 50,
        },
      });
      if (data.success) {
        setDiscussionPosts(data.posts || []);
      }
    } catch (err) {
      console.warn("[discussion] fetch error:", err.message);
    } finally {
      setLoadingDiscussion(false);
    }
  }, [id]);

  useEffect(() => {
    if (tab === "discussion") {
      fetchMatchPosts();
    }
  }, [tab, fetchMatchPosts]);

  const handlePostComment = async (e) => {
    e?.preventDefault();
    if (!commentText.trim() || !user || commenting) return;
    setCommenting(true);
    try {
      const statusTag = match?.status === "LIVE" ? "LIVE" : match?.status === "UPCOMING" ? "UPCOMING" : "COMPLETED";
      const { data } = await api.post("/posts", {
        content: commentText.trim(),
        matchTag: id,
        matchStatus: statusTag,
      });
      if (data.success && data.post) {
        setDiscussionPosts((prev) => [data.post, ...prev]);
        setCommentText("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post comment");
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteComment = (deletedId) => {
    setDiscussionPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };
`;

code = code.replace(stateInsertionTarget, newStateCode);

// 3. Remove old generic posts useEffect
code = code.replace(
  /\/\/ Load community posts for discussion tab[\s\S]*?api\.get\("\/posts", \{ params: \{ limit: 3 \} \}\)[\s\S]*?\}, \[\]\);/,
  '// Discussion posts are loaded via fetchMatchPosts when tab is active'
);

// 4. Replace discussion tab JSX
const oldDiscussionJSX = /\{\/\* Discussion \*\/\}[\s\S]*?\{tab === "discussion" && \([\s\S]*?\n        \)\}/;

const newDiscussionJSX = `{/* Discussion */}
        {tab === "discussion" && (
          <div className="space-y-6">
            <div className="glass p-5 rounded-xl border border-white/10">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-broadcast" />
                  <p className="font-display text-sm font-semibold text-ink">Match Discussion</p>
                </div>
                {user ? (
                  <span className="text-[11px] text-ink-muted">
                    Signed in as <span className="font-semibold text-broadcast">{user.name}</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-ink-faint">Guest Mode</span>
                )}
              </div>

              {user ? (
                <form onSubmit={handlePostComment} className="space-y-3">
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your tactical analysis, match prediction, or reactions with other fans..."
                    className="input resize-none text-sm"
                    disabled={commenting}
                  />
                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <p className="text-[11px] text-ink-faint">
                      Posts are permanently saved to database and visible to all fans.
                    </p>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || commenting}
                      className="btn-primary !px-4 !py-2 text-xs flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{commenting ? "Posting..." : "Post Comment"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center">
                  <p className="text-sm text-ink-muted mb-2">
                    Join the discussion for this match to share your opinions and predictions.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className="btn-primary !px-4 !py-1.5 text-xs inline-flex items-center gap-1"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      state={{ from: location.pathname }}
                      className="btn-ghost !px-4 !py-1.5 text-xs inline-flex items-center gap-1"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* List of match posts */}
            <div className="space-y-4">
              {loadingDiscussion ? (
                <div className="glass p-8 text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-broadcast mx-auto mb-2" />
                  <p className="text-xs text-ink-muted">Loading match discussions...</p>
                </div>
              ) : discussionPosts.length > 0 ? (
                discussionPosts.map((p) => (
                  <CommunityPost key={p.id} post={p} onDelete={handleDeleteComment} />
                ))
              ) : (
                <EmptyState
                  title="No match discussions yet"
                  subtitle="Be the first fan to comment on this match!"
                />
              )}
            </div>
          </div>
        )}`;

code = code.replace(oldDiscussionJSX, newDiscussionJSX);

fs.writeFileSync(matchDetailsPath, code, 'utf8');
console.log('Successfully patched MatchDetails.jsx with full interactive Discussion tab!');
