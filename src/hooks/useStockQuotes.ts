"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface YahooQuote {
  price: number;
  currency: string;
  time: number | null;
}

export interface QuotesResponse {
  quotes: Record<string, YahooQuote | null>;
  fx: Record<string, number | null>;
  fetchedAt: number;
}

export function useStockQuotes(refreshMs = 90000) {
  const [data, setData] = useState<QuotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const inFlight = useRef(false);

  const fetchQuotes = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/quotes", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as QuotesResponse;
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const id = setInterval(fetchQuotes, refreshMs);
    return () => clearInterval(id);
  }, [fetchQuotes, refreshMs]);

  return { data, loading, error, refresh: fetchQuotes };
}
