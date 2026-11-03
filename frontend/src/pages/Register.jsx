import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ShieldCheck, Flame } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const strength = useMemo(() => {
    const p = form.password;
    if (!p) return { level: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2) return { level: 1, label: "Weak", color: "bg-alert text-alert" };
    if (score <= 3) return { level: 2, label: "Moderate", color: "bg-intel text-intel" };
    return { level: 3, label: "Strong", color: "bg-live text-live" };
  }, [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.name.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.confirm);
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Registration failed.");
    }
  };

  return (
    <div className="section-pad grid min-h-[calc(100vh-64px)] items-center gap-10 py-14 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-sm lg:order-2">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-broadcast to-intel font-display font-bold text-white shadow-lg">
            MF
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Match<span className="text-gradient">Fusion</span>
          </span>
        </div>

        <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Join the community — free international sports analysis & match debates.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Full name</label>
            <input
              id="register-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="e.g. Alex Morgan"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Email address</label>
            <input
              type="email"
              id="register-email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">Password</label>
              {strength.label && (
                <span className={`text-[11px] font-semibold ${strength.color.split(" ")[1]}`}>
                  {strength.label}
                </span>
              )}
            </div>
            <input
              type="password"
              id="register-password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            {form.password && (
              <div className="mt-1.5 flex h-1 w-full gap-1 overflow-hidden rounded bg-white/10">
                <div
                  className={`h-full transition-all ${
                    strength.level >= 1 ? "w-1/3 bg-alert" : "w-0"
                  }`}
                />
                <div
                  className={`h-full transition-all ${
                    strength.level >= 2 ? "w-1/3 bg-intel" : "w-0"
                  }`}
                />
                <div
                  className={`h-full transition-all ${
                    strength.level >= 3 ? "w-1/3 bg-live" : "w-0"
                  }`}
                />
              </div>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Confirm password</label>
            <input
              type="password"
              id="register-confirm"
              required
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="input"
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="rounded-lg bg-alert/10 px-3 py-2 text-xs text-alert">{error}</p>}

          <button
            type="submit"
            id="register-submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-broadcast hover:underline">
            Log in
          </Link>
        </p>
      </div>

      <div className="hidden lg:order-1 lg:block">
        <div className="glass card-sheen relative overflow-hidden p-10">
          <div className="pointer-events-none absolute inset-0 bg-fusion-radial" />
          <div className="relative mb-6 flex items-center gap-2">
            <Flame className="h-5 w-5 text-live" />
            <p className="eyebrow">Public Sports Platform</p>
          </div>
          <h2 className="relative font-display text-3xl font-semibold leading-tight text-ink">
            Live scoreboards, verified AI insights & community polls for{" "}
            <span className="text-gradient">global football & cricket</span>.
          </h2>
          <div className="relative mt-6 space-y-3 text-sm text-ink-muted">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-live" />
              <span>Free registered account with persistent profile</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-live" />
              <span>Create match-linked discussions and community polls</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-live" />
              <span>Real-time score updates across all major international series</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
