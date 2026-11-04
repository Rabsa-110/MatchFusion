import { useState, useEffect, useRef } from "react";
import { Search, X, Check, Calendar, Radio } from "lucide-react";
import api from "../../api/axios.js";

export default function MatchAutocomplete({ selectedMatch, onSelectMatch, disabled }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || selectedMatch) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      setLoading(true);
      api
        .get("/matches", {
          params: { search: query.trim(), limit: 8 },
          signal: controller.signal,
        })
        .then(({ data }) => {
          if (data.success) {
            setResults(data.matches || []);
            setIsOpen(true);
          }
        })
        .catch((err) => {
          if (err.name !== "CanceledError" && err.name !== "AbortError") {
            setResults([]);
          }
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, selectedMatch]);

  const handleSelect = (match) => {
    onSelectMatch(match);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectMatch(null);
    setQuery("");
    setResults([]);
  };

  if (selectedMatch) {
    const isCricket = selectedMatch.sport === "cricket";
    const homeName = selectedMatch.home?.name || selectedMatch.homeTeam || "Home";
    const awayName = selectedMatch.away?.name || selectedMatch.awayTeam || "Away";

    return (
      <div className="flex items-center justify-between rounded-lg border border-broadcast/30 bg-broadcast/10 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-sm">{isCricket ? "🏏" : "⚽"}</span>
          <span className="font-semibold text-ink truncate">
            {homeName} vs {awayName}
          </span>
          <span className="text-[10px] text-ink-muted hidden sm:inline truncate">
            ({selectedMatch.competition})
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
              selectedMatch.status === "LIVE"
                ? "bg-live/20 text-live border border-live/30"
                : selectedMatch.status === "UPCOMING"
                ? "bg-intel/20 text-intel border border-intel/30"
                : "bg-white/10 text-ink-muted"
            }`}
          >
            {selectedMatch.status}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="ml-2 text-ink-faint hover:text-alert p-1 transition"
          title="Remove linked match"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Link a match (e.g. Bangladesh vs India, Real Madrid, Manipur)..."
          className="input !py-1.5 !pl-9 !pr-8 text-xs w-full"
          disabled={disabled}
        />
        {loading && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-broadcast" />
          </div>
        )}
      </div>

      {isOpen && query.trim() && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-white/10 bg-midnight-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
          {results.length > 0 ? (
            results.map((m) => {
              const isCricket = m.sport === "cricket";
              const home = m.home?.name || m.homeTeam || "Home";
              const away = m.away?.name || m.awayTeam || "Away";

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-white/[0.08]"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span>{isCricket ? "🏏" : "⚽"}</span>
                    <div className="truncate">
                      <p className="font-medium text-ink truncate">
                        {home} vs {away}
                      </p>
                      <p className="text-[10px] text-ink-faint truncate">
                        {m.competition} · {m.date || m.time || "Scheduled"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase shrink-0 ${
                      m.status === "LIVE"
                        ? "bg-live/20 text-live"
                        : m.status === "UPCOMING"
                        ? "bg-intel/20 text-intel"
                        : "bg-white/10 text-ink-muted"
                    }`}
                  >
                    {m.status}
                  </span>
                </button>
              );
            })
          ) : !loading ? (
            <div className="px-3 py-3 text-center text-xs text-ink-muted">
              No matches found for "{query}". Try team name or competition.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
