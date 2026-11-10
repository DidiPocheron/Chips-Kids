import { NextResponse } from "next/server";
import { STOCK_POSITIONS } from "@/data/stockPositions";

// Cours boursiers en direct via l'API publique (non officielle) de Yahoo
// Finance. Aucune clé n'est requise, mais Yahoo peut occasionnellement
// bloquer/limiter une valeur — chaque symbole échoue indépendamment des
// autres (le front-end retombe alors sur le PRU pour cette ligne).

export const dynamic = "force-dynamic";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const FX_YAHOO_SYMBOL: Record<string, string> = {
  USD: "USDEUR=X",
  CAD: "CADEUR=X",
  JPY: "JPYEUR=X",
  GBP: "GBPEUR=X",
};

interface YahooQuote {
  price: number;
  currency: string;
  time: number | null;
}

async function fetchYahooQuote(symbol: string): Promise<YahooQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?range=1d&interval=1d`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  const price = result?.meta?.regularMarketPrice;
  const currency = result?.meta?.currency;
  const time = result?.meta?.regularMarketTime ?? null;

  if (typeof price !== "number" || typeof currency !== "string") {
    throw new Error("réponse Yahoo Finance inattendue");
  }

  return { price, currency, time };
}

export async function GET() {
  const symbols = Array.from(new Set(STOCK_POSITIONS.map((p) => p.yahooSymbol)));

  const fxCurrencies = Array.from(
    new Set(
      STOCK_POSITIONS.map((p) => (p.currency === "GBX" ? "GBP" : p.currency)).filter(
        (c) => c !== "EUR"
      )
    )
  );

  const [quoteEntries, fxEntries] = await Promise.all([
    Promise.all(
      symbols.map(async (sym) => {
        try {
          return [sym, await fetchYahooQuote(sym)] as const;
        } catch {
          return [sym, null] as const;
        }
      })
    ),
    Promise.all(
      fxCurrencies.map(async (cur) => {
        const sym = FX_YAHOO_SYMBOL[cur];
        if (!sym) return [cur, null] as const;
        try {
          const q = await fetchYahooQuote(sym);
          return [cur, q.price] as const;
        } catch {
          return [cur, null] as const;
        }
      })
    ),
  ]);

  return NextResponse.json({
    quotes: Object.fromEntries(quoteEntries) as Record<string, YahooQuote | null>,
    fx: Object.fromEntries(fxEntries) as Record<string, number | null>,
    fetchedAt: Date.now(),
  });
}
