"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankrollChart } from "@/components/bankroll/BankrollChart";
import { TrendingUp, TrendingDown, Euro, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/hooks/useSessionStore";

const INITIAL_BANKROLL = 500;

export default function BankrollPage() {
  const { currentBankroll, sessions } = useSessionStore();
  const entries = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((s) => ({ id: s.id, date: new Date(s.date), amount: s.bankroll.total }));
  }, [sessions]);

  const PLATFORMS = [
    { name: "Winamax", amount: currentBankroll.winamax },
    { name: "PokerStars", amount: currentBankroll.pokerstars },
    { name: "Unibet", amount: currentBankroll.unibet ?? 0 },
    { name: "PMU", amount: currentBankroll.pmu ?? 0 },
    { name: "Porte-monnaie", amount: currentBankroll.wallet },
  ];

  const pnl = currentBankroll.total - INITIAL_BANKROLL;
  const pct = (pnl / INITIAL_BANKROLL) * 100;
  const isProfit = pnl >= 0;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Dashboard Bankroll</h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Euro className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Bankroll</span>
            </div>
            <div className={cn("text-2xl font-bold", isProfit ? "text-primary" : "text-destructive")}>
              {currentBankroll.total.toLocaleString("fr-FR")}€
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              {isProfit ? (
                <TrendingUp className="w-4 h-4 text-primary" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm text-muted-foreground">P&L</span>
            </div>
            <div className={cn("text-2xl font-bold", isProfit ? "text-primary" : "text-destructive")}>
              {pnl >= 0 ? "+" : ""}{pnl.toLocaleString("fr-FR")}€
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Percent className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Évolution</span>
            </div>
            <div className={cn("text-2xl font-bold", isProfit ? "text-primary" : "text-destructive")}>
              {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="text-base">Répartition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PLATFORMS.map(({ name, amount }) => (
              <div key={name}>
                <div className="text-sm text-muted-foreground mb-1">{name}</div>
                <div className="font-semibold text-primary">{amount.toLocaleString("fr-FR")}€</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Évolution de la bankroll</CardTitle>
        </CardHeader>
        <CardContent>
          <BankrollChart entries={entries} referenceLine={500} />
        </CardContent>
      </Card>
    </div>
  );
}
