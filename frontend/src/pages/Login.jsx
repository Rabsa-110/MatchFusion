import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
          <p className="eyebrow relative mb-4">Welcome back</p>
          <h2 className="relative font-display text-3xl font-semibold leading-tight text-ink">
            Pick up right where the <span className="text-gradient">fusion</span> left off.
          </h2>
          <p className="relative mt-4 max-w-sm text-sm text-ink-muted">
            Your polls, posts, and followed matches are waiting for you.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-ink">Log in</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Sign in to your MatchFusion account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Email</label>
            <input
              type="email"
              id="login-email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Password</label>
            <input
              type="password"
              id="login-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="rounded-lg bg-alert/10 px-3 py-2 text-xs text-alert">{error}</p>}

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-broadcast hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
