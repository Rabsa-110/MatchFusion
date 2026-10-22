import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
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
        <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Join the MatchFusion community — free forever.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Full name</label>
            <input
              id="register-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Email</label>
            <input
              type="email"
              id="register-email"
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
              id="register-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Confirm password</label>
            <input
              type="password"
              id="register-confirm"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="input"
              placeholder="••••••••"
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
          <p className="eyebrow relative mb-4">Join the fusion</p>
          <h2 className="relative font-display text-3xl font-semibold leading-tight text-ink">
            Post, react, and vote with fans who <span className="text-gradient">live for this</span>.
          </h2>
          <p className="relative mt-4 max-w-sm text-sm text-ink-muted">
            Free to join. No payment details required, ever.
          </p>
        </div>
      </div>
    </div>
  );
}
