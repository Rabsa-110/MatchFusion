// frontend/src/hooks/useMatches.js
// Custom hook for fetching match data from the backend API.
// Includes loading, error, and data-freshness states.

import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios.js";

/**
 * @param {Object} options
 * @param {string} [options.sport] - "football" | "cricket" | "all"
 * @param {string} [options.status] - "live" | "upcoming" | "completed" | "all"
 * @param {number} [options.limit] - max results
 * @param {boolean} [options.autoRefresh] - poll the backend (not provider) every refreshIntervalMs
 * @param {number} [options.refreshIntervalMs] - how often to re-fetch from our own backend (default: 60s)
 */
export function useMatches({
  sport = "all",
  status = "all",
  limit,
  autoRefresh = false,
  refreshIntervalMs = 60000,
} = {}) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const abortRef = useRef(null);

  const fetch = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    try {
      const params = {};
      if (sport !== "all") params.sport = sport;
      if (status !== "all") params.status = status;
      if (limit) params.limit = limit;

      const { data } = await api.get("/matches", {
        params,
        signal: controller.signal,
      });

      if (data.success) {
        setMatches(data.matches || []);
        setCacheInfo(data.cache || null);
      } else {
        setError(data.message || "Failed to load matches");
      }
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        const msg =
          err.response?.data?.message ||
          "Cannot connect to MatchFusion server. Is the backend running on http://localhost:5000?";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [sport, status, limit]);

  useEffect(() => {
    setLoading(true);
    fetch();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetch, refreshIntervalMs);
    }

    return () => {
      if (abortRef.current) abortRef.current.abort();
      clearInterval(interval);
    };
  }, [fetch, autoRefresh, refreshIntervalMs]);

  return { matches, loading, error, cacheInfo, refetch: fetch };
}

/**
 * Hook for a single match by ID.
 */
export function useMatch(id) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/matches/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (data.success) {
          setMatch(data.match);
        } else {
          setError(data.message || "Match not found");
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(
            err.response?.data?.message ||
              "Cannot connect to MatchFusion server."
          );
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id]);

  return { match, loading, error };
}
