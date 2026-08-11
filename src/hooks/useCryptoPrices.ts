"use client";

import { useState, useEffect, useCallback } from "react";

export type PriceMap = Record<string, number | null>;

const COINGECKO_IDS = "bitcoin,ethereum,solana,ripple";

export function useCryptoPrices() {
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=eur`,
        { next: { revalidate: 0 } }
      );
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setPrices({
        bitcoin: data.bitcoin?.eur ?? null,
        ethereum: data.ethereum?.eur ?? null,
        solana: data.solana?.eur ?? null,
        ripple: data.ripple?.eur ?? null,
      });
      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  return { prices, loading, error, refresh: fetchPrices, lastUpdated };
}
