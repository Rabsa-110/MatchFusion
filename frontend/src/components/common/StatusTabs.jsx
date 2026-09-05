export default function StatusTabs({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`chip ${value === opt.id ? "chip-active" : "hover:border-white/20"}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
