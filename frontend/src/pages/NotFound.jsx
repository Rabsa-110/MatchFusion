import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="section-pad flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-gradient font-display text-6xl font-bold">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Off the pitch</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        This page doesn't exist. Let's get you back to the match center.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
