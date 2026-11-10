import { NextResponse } from "next/server";

// Cours crypto en direct. CoinGecko a été abandonné pour cette route : ses
// réponses HTTP 403 persistent même avec un User-Agent de navigateur, ce qui
// pointe vers un blocage Cloudflare par plage d'IP d'hébergeur (Vercel...)
// plutôt qu'un simple filtre anti-bot contournable -- un problème connu et
// largement rapporté avec CoinGecko en accès sans clé.
//
// On utilise à la place l'API publique de Kraken, qui expose directement les
// paires en euros (pas besoin d'une conversion USD -> EUR) et ne bloque pas
// ce type d'appel serveur.
//
// Amortisseurs conservés : un petit cache en mémoire (1 minute) pour limiter
// le nombre d'appels sortants, et un repli sur la dernière valeur connue en
// cas d'échec (marquée `stale`) plutôt que de faire disparaître le montant.

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60_000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface PriceMap {
  bitcoin: number | null;
  ethereum: number | null;
  solana: number | null;
  ripple: number | null;
}

// Convention de nommage historique de Kraken : les actifs "anciens" (BTC,
// ETH, XRP) portent un préfixe X, et la devise fiat un préfixe Z ; les
// actifs plus récents (SOL) n'en ont pas.
const KRAKEN_PAIRS: Record<keyof PriceMap, string> = {
  bitcoin: "XXBTZEUR",
  ethereum: "XETHZEUR",
  solana: "SOLEUR",
  ripple: "XXRPZEUR",
};

let cache: { data: PriceMap; fetchedAt: number } | null = null;

async function fetchFromKraken(): Promise<PriceMap> {
  const pairs = Object.values(KRAKEN_PAIRS).join(",");
  const res = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pairs}`, {
    cache: "no-store",
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Kraken a répondu HTTP ${res.status}`);

  const json = await res.json();
  if (Array.isArray(json.error) && json.error.length > 0) {
    throw new Error(`Kraken a renvoyé une erreur : ${json.error.join(", ")}`);
  }

  const result = json.result ?? {};
  const priceFor = (pairSymbol: string): number | null => {
    const raw = result[pairSymbol]?.c?.[0];
    const parsed = raw !== undefined ? parseFloat(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    bitcoin: priceFor(KRAKEN_PAIRS.bitcoin),
    ethereum: priceFor(KRAKEN_PAIRS.ethereum),
    solana: priceFor(KRAKEN_PAIRS.solana),
    ripple: priceFor(KRAKEN_PAIRS.ripple),
  };
}

export async function GET() {
  const now = Date.now();

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ ...cache.data, fetchedAt: cache.fetchedAt, stale: false });
  }

  try {
    const data = await fetchFromKraken();
    cache = { data, fetchedAt: now };
    return NextResponse.json({ ...data, fetchedAt: now, stale: false });
  } catch (err) {
    console.error("[api/crypto-prices] Échec de l'appel à Kraken :", err);
    if (cache) {
      return NextResponse.json({ ...cache.data, fetchedAt: cache.fetchedAt, stale: true });
    }
    return NextResponse.json(
      { bitcoin: null, ethereum: null, solana: null, ripple: null, fetchedAt: now, stale: true },
      { status: 502 }
    );
  }
}
