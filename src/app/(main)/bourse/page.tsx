"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankrollChart } from "@/components/bankroll/BankrollChart";
import Link from "next/link";
import { TrendingUp, TrendingDown, Euro, Percent, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBourseTicketStore } from "@/hooks/useBourseTicketStore";

export default function BoursePage() {
  const { tickets, loaded } = useBourseTicketStore();

  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => a.date.localeCompare(b.date)),
    [tickets]
  );

  const chartEntries = useMemo(() =>
    sortedTickets.map(t => ({
      id: t.id,
      date: new Date(t.date),
      amount: t.ctPortfolioValue + t.peaPortfolioValue,
    })),
    [sortedTickets]
  );

  const peaEntries = useMemo(() =>
    sortedTickets.map(t => ({
      id: t.id,
      date: new Date(t.date),
      amount: t.peaPortfolioValue,
    })),
    [sortedTickets]
  );

  const ctEntries = useMemo(() =>
    sortedTickets.map(t => ({
      id: t.id,
      date: new Date(t.date),
      amount: t.ctPortfolioValue,
    })),
    [sortedTickets]
  );

  const currentAmount = sortedTickets.length > 0
    ? sortedTickets[sortedTickets.length - 1].ctPortfolioValue + sortedTickets[sortedTickets.length - 1].peaPortfolioValue
    : 0;
  const firstAmount = sortedTickets.length > 0
    ? sortedTickets[0].ctPortfolioValue + sortedTickets[0].peaPortfolioValue
    : 0;

  const pnl = currentAmount - firstAmount;
  const pct = firstAmount > 0 ? (pnl / firstAmount) * 100 : 0;
  const isUp = pnl >= 0;
  const hasData = tickets.length > 0;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Bourse</h1>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground text-sm">Portefeuille actions</p>
            <Link
              href="/bourse/historique"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-md px-2 py-1"
            >
              <History className="w-3 h-3" />
              Historique 2020–2026
            </Link>
          </div>
        </div>
      </div>

      {!hasData && loaded ? (
        <div className="text-center py-24 text-muted-foreground">
          <p>Aucune donnée pour l&apos;instant.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Euro className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Valeur actuelle</span>
                </div>
                <div className="text-2xl font-bold text-blue-400 tabular-nums">
                  {currentAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  {isUp ? <TrendingUp className="w-4 h-4 text-primary" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                  <span className="text-sm text-muted-foreground">P&amp;L</span>
                </div>
                <div className={cn("text-2xl font-bold tabular-nums", isUp ? "text-primary" : "text-destructive")}>
                  {pnl >= 0 ? "+" : ""}{pnl.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Évolution</span>
                </div>
                <div className={cn("text-2xl font-bold", isUp ? "text-primary" : "text-destructive")}>
                  {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {chartEntries.length > 1 && (
            <Card className="mb-8">
              <CardHeader><CardTitle className="text-base">Évolution du portefeuille</CardTitle></CardHeader>
              <CardContent><BankrollChart entries={chartEntries} /></CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {peaEntries.length > 1 && (
              <Card>
                <CardHeader><CardTitle className="text-base">PEA</CardTitle></CardHeader>
                <CardContent>
                  <BankrollChart entries={peaEntries} color="oklch(0.65 0.18 255)" label="PEA" />
                </CardContent>
              </Card>
            )}
            {ctEntries.length > 1 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Compte titre — Degiro</CardTitle></CardHeader>
                <CardContent>
                  <BankrollChart entries={ctEntries} color="oklch(0.75 0.15 80)" label="Compte titre" />
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
