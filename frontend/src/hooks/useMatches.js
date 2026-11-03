// frontend/src/hooks/useMatches.js
// Custom hook for fetching match data from MatchFusion backend API.

import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios.js";

/**
 * @param {Object} options
 * @param {string} [options.sport] - "football" | "cricket" | "all"
 * @param {string} [options.status] - "live" | "upcoming" | "completed" | "all"
 * @param {string} [options.search] - text search / alias
 * @param {string} [options.sortBy] - "priority" | "live" | "recent" | "upcoming"
 * @param {number} [options.limit] - max results
 * @param {boolean} [options.autoRefresh] - poll backend every refreshIntervalMs
 * @param {number} [options.refreshIntervalMs] - interval (default: 60s)
 */
export function useMatches({
  sport = "all",
  status = "all",
  search,
  sortBy = "priority",
  limit,
  autoRefresh = false,
  refreshIntervalMs = 60000,
} = {}) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const abortRef = useRef(null);

  const fetchMatches = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    try {
      const params = {};
      if (sport !== "all") params.sport = sport;
      if (status !== "all") params.status = status;
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;
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
          "Unable to connect to MatchFusion API. Please check your connection.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [sport, status, search, sortBy, limit]);

  useEffect(() => {
    setLoading(true);
    fetchMatches();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchMatches, refreshIntervalMs);
    }

    return () => {
      if (abortRef.current) abortRef.current.abort();
      clearInterval(interval);
    };
  }, [fetchMatches, autoRefresh, refreshIntervalMs]);

  /**
   * Triggers a live provider refresh on the backend (POST /api/matches/refresh).
   * Respects rate limits and updates displayed data immediately upon completion.
   */
  const forceRefresh = useCallback(async (targetSport) => {
    if (refreshing) return;
    setRefreshing(true);
    setError(null);
    try {
      const { data } = await api.post("/matches/refresh", {
        sport: targetSport || sport || "all",
      });
      // Immediately reload fresh data
      await fetchMatches();
      return { success: true, message: data.message || "Scores refreshed" };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Refresh rate limit reached. Matches are refreshed automatically every 30 minutes.";
      return { success: false, error: msg };
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, sport, fetchMatches]);

  return {
    matches,
    loading,
    refreshing,
    error,
    cacheInfo,
    refetch: fetchMatches,
    forceRefresh,
  };
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
              "Unable to load match details. Please try again."
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
