export default function SportSwitcher({ value, onChange }) {
  const options = [
    { id: "all", label: "All Sports" },
    { id: "football", label: "⚽ Football" },
    { id: "cricket", label: "🏏 Cricket" },
  ];
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
