import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Flame, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in both fields.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed.");
    }
  };

  return (
    <div className="section-pad grid min-h-[calc(100vh-64px)] items-center gap-10 py-14 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="glass card-sheen relative overflow-hidden p-10">
          <div className="pointer-events-none absolute inset-0 bg-fusion-radial" />
          <div className="relative mb-6 flex items-center gap-2">
            <Flame className="h-5 w-5 text-live" />
            <p className="eyebrow">MatchFusion Network</p>
          </div>
          <h2 className="relative font-display text-3xl font-semibold leading-tight text-ink">
            Pick up right where the <span className="text-gradient">fusion</span> left off.
          </h2>
          <p className="relative mt-4 max-w-sm text-sm text-ink-muted">
            Your polls, match predictions, and community discussions are waiting for you.
          </p>
          <div className="relative mt-6 space-y-3 text-sm text-ink-muted">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-live" />
              <span>Full access to voting and post reactions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-live" />
              <span>AI analysis with verified statistical probability breakdowns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-broadcast to-intel font-display font-bold text-white shadow-lg">
            MF
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Match<span className="text-gradient">Fusion</span>
          </span>
        </div>

        <h1 className="font-display text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Access your MatchFusion account and activity.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Email address</label>
            <input
              type="email"
              id="login-email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint transition hover:text-ink focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="rounded-lg bg-alert/10 px-3 py-2 text-xs text-alert">{error}</p>}

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-broadcast hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
