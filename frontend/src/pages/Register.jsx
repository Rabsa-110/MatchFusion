import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
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
    login(form.name, form.email);
    navigate("/");
  };

  return (
    <div className="section-pad grid min-h-[calc(100vh-64px)] items-center gap-10 py-14 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-sm lg:order-2">
        <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          This is a UI demo signup for the progress build — see PROGRESS.md for the real
          JWT/bcrypt auth plan.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Full name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Confirm password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="input"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-alert">{error}</p>}

          <button type="submit" className="btn-primary w-full justify-center">
            Create account
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
