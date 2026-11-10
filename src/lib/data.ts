import type { BankrollEntry, SessionPost, BankrollTier } from "@/types";

export const BANKROLL_ENTRIES: BankrollEntry[] = [];

export function processBankrollEntries(entries: BankrollEntry[]): BankrollEntry[] {
  return entries.map((entry) => ({ ...entry }));
}

export const SESSION_POSTS: SessionPost[] = [];

// Extrait le montant en euros le plus élevé d'un texte du type "10€ / 20€"
// (ou "20€" pour une seule valeur) -- c'est ce montant max qui sert de
// référence pour calculer le nombre de buy-ins possibles sur ce palier.
function parseMaxEuroAmount(value: string): number {
  const amounts = value
    .split("/")
    .map((part) => parseInt(part.replace(/[^\d]/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  return Math.max(...amounts);
}

// Calcule le nombre de buy-ins (à `buyIn` €) que permet ce palier de
// bankroll, et le formule selon que le palier est ouvert en bas ("Moins de
// X€"), ouvert en haut ("À partir de X€"), ou borné des deux côtés -- dans ce
// dernier cas, sous forme de fourchette entre le bas et le haut du palier.
function formatBuyInCount(category: string, buyIn: number, minAmount: number, maxAmount: number | null): string {
  if (minAmount === 0 && maxAmount !== null) {
    return `jusqu'à ${Math.floor(maxAmount / buyIn)} buy-ins (${category})`;
  }
  if (maxAmount === null) {
    return `à partir de ${Math.floor(minAmount / buyIn)} buy-ins (${category})`;
  }
  return `${Math.floor(minAmount / buyIn)} – ${Math.floor(maxAmount / buyIn)} buy-ins (${category})`;
}

function buildMinBuyIn(tier: Omit<BankrollTier, "minBuyIn">): string {
  const tournamentsBuyIn = parseMaxEuroAmount(tier.tournaments);
  const spinsBuyIn = parseMaxEuroAmount(tier.spins);
  return [
    formatBuyInCount("tournois", tournamentsBuyIn, tier.minAmount, tier.maxAmount),
    formatBuyInCount("spins", spinsBuyIn, tier.minAmount, tier.maxAmount),
  ].join(" / ");
}

// Profil "sérieux, standard" : 200 buy-ins minimum sur le buy-in le plus
// élevé du palier, aussi bien en tournois (MTT) qu'en spins (Expressos).
// Chaque palier commence donc à 200 × ce buy-in (ex. spins 10€ -> 2 000€).
const RAW_BANKROLL_TIERS: Omit<BankrollTier, "minBuyIn">[] = [
  {
    minAmount: 0,
    maxAmount: 400,
    label: "Moins de 400€",
    tournaments: "1€",
    spins: "1€",
  },
  {
    minAmount: 400,
    maxAmount: 1000,
    label: "400€ – 1 000€",
    tournaments: "1€ / 2€",
    spins: "2€",
  },
  {
    minAmount: 1000,
    maxAmount: 2000,
    label: "1 000€ – 2 000€",
    tournaments: "2€ / 5€",
    spins: "5€",
  },
  {
    minAmount: 2000,
    maxAmount: 4000,
    label: "2 000€ – 4 000€",
    tournaments: "5€ / 10€",
    spins: "10€",
  },
  {
    minAmount: 4000,
    maxAmount: 10000,
    label: "4 000€ – 10 000€",
    tournaments: "10€ / 20€",
    spins: "20€",
  },
  {
    minAmount: 10000,
    maxAmount: null,
    label: "À partir de 10 000€",
    tournaments: "20€ / 50€",
    spins: "50€",
  },
];

export const BANKROLL_TIERS: BankrollTier[] = RAW_BANKROLL_TIERS.map((tier) => ({
  ...tier,
  minBuyIn: buildMinBuyIn(tier),
}));
