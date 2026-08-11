import type { BankrollEntry, SessionPost, BankrollTier } from "@/types";

export const BANKROLL_ENTRIES: BankrollEntry[] = [];

export function processBankrollEntries(entries: BankrollEntry[]): BankrollEntry[] {
  return entries.map((entry) => ({ ...entry }));
}

export const SESSION_POSTS: SessionPost[] = [];

export const BANKROLL_TIERS: BankrollTier[] = [
  {
    minAmount: 0,
    maxAmount: 625,
    label: "Moins de 625€",
    tournaments: "2€ / 5€",
    expressos: "2€",
    minBuyIn: "125 buy-ins (tournois) / 250 buy-ins (expresso)",
  },
  {
    minAmount: 625,
    maxAmount: 1250,
    label: "625€ – 1 250€",
    tournaments: "5€ / 10€",
    expressos: "5€",
    minBuyIn: "125 buy-ins (tournois) / 250 buy-ins (expresso)",
  },
  {
    minAmount: 1250,
    maxAmount: 2500,
    label: "1 250€ – 2 500€",
    tournaments: "10€ / 20€",
    expressos: "10€",
    minBuyIn: "125 buy-ins (tournois) / 250 buy-ins (expresso)",
  },
  {
    minAmount: 2500,
    maxAmount: 6250,
    label: "2 500€ – 6 250€",
    tournaments: "20€ / 50€",
    expressos: "10€",
    minBuyIn: "125 buy-ins (tournois) / 250 buy-ins (expresso)",
  },
  {
    minAmount: 6250,
    maxAmount: null,
    label: "À partir de 6 250€",
    tournaments: "50€ / 100€",
    expressos: "25€",
    minBuyIn: "125 buy-ins (tournois) / 250 buy-ins (expresso)",
  },
];
