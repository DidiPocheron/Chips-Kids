"use client";

import { useState, useEffect, useCallback } from "react";

export type PriceMap = Record<string, number | null>;

// Passe par /api/crypto-prices (proxy côté serveur) plutôt que d'appeler
// api.coingecko.com directement depuis le navigateur -- CoinGecko ne renvoie
// pas d'en-têtes CORS pour les requêtes client-side, donc un fetch direct
// échoue silencieusement ici et faisait disparaître le montant crypto.
export function useCryptoPrices() {
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/crypto-prices", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setPrices({
        bitcoin: data.bitcoin ?? null,
        ethereum: data.ethereum ?? null,
        solana: data.solana ?? null,
        ripple: data.ripple ?? null,
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
