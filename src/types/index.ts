export interface BankrollEntry {
  id: string;
  date: Date;
  amount: number;
  note?: string;
}

export interface PortfolioEntry {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

export interface BourseTicket {
  id: string;
  date: string;
  // Compte titre
  ctPortfolioValue: number;
  ctInvestedValue: number;
  ctPnl: number;
  // PEA
  peaPortfolioValue: number;
  peaInvestedValue: number;
  peaPnl: number;
  description: string;
  photos: string[];
}

export type CryptoOperationType = "achat" | "vente" | "staking" | "dca" | "transfert" | "autre";

export interface CryptoLogEntry {
  id: string;
  date: string;
  type: CryptoOperationType;
  crypto: string;
  quantity: number;
  valueEur: number;
  platform: string;
  note?: string;
}

export type SessionRating = "excellent" | "good" | "ras" | "not-good" | "catastrophique";

export interface SessionBankroll {
  winamax: number;
  pokerstars: number;
  unibet: number;
  pmu: number;
  wallet: number;
  total: number;
}

export interface SessionPost {
  id: string;
  date: string;
  rating: SessionRating;
  bankroll: SessionBankroll;
  description: string;
  photos: string[];
}

export interface BankrollTier {
  minAmount: number;
  maxAmount: number | null;
  label: string;
  tournaments: string;
  expressos: string;
  minBuyIn: string;
}

export type CryptoRating = "excellent" | "good" | "ras" | "not-good" | "catastrophique";

export interface CryptoPortfolio {
  bitcoin: number;
  ethereum: number;
  solana: number;
  ripple: number;
  bitcoinAvg?: number;
  ethereumAvg?: number;
  solanaAvg?: number;
  rippleAvg?: number;
}

export interface CryptoSnapshotPrices {
  bitcoin?: number;
  ethereum?: number;
  solana?: number;
  ripple?: number;
}

export interface CryptoTicket {
  id: string;
  date: string;
  rating: CryptoRating;
  portfolio: CryptoPortfolio;
  snapshotPrices?: CryptoSnapshotPrices;
  description: string;
  photos: string[];
}

export type GameFormat = "tournois" | "expresso" | "cashgame";

export type BetAmount = "5€" | "10€" | "12€" | "20€" | "25€" | "50€" | "100€";

export interface BetCounts {
  "5€": number;
  "10€": number;
  "12€": number;
  "20€": number;
  "25€": number;
  "50€": number;
  "100€": number;
}
