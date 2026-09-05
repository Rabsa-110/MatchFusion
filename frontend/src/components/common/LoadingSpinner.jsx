export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-broadcast" />
      <p className="text-xs uppercase tracking-widest">{label}</p>
    </div>
  );
}
