"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankrollChart } from "@/components/bankroll/BankrollChart";
import { TrendingUp, TrendingDown, Euro, Percent, GraduationCap, Trophy, Laptop, Receipt, Wallet } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/hooks/useSessionStore";
import { PageLoader } from "@/components/PageLoader";
import { POKER_FEES, cumulativeFeesAsOf } from "@/lib/pokerFees";

const INITIAL_BANKROLL = 500;

// Icône décorative par type de frais -- purement cosmétique, devinée sur des
// mots-clés du libellé (pas de champ dédié, les frais restent une petite
// liste ajoutée à la main plutôt qu'un formulaire).
function feeIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("formation")) return GraduationCap;
  if (l.includes("tournoi")) return Trophy;
  if (l.includes("macbook") || l.includes("ordinateur") || l.includes("pc")) return Laptop;
  return Receipt;
}

export default function BankrollPage() {
  const { currentBankroll, sessions, loaded } = useSessionStore();
  const entries = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((s) => ({ id: s.id, date: new Date(s.date), amount: s.bankroll.total }));
  }, [sessions]);
  // Argent réellement gagné au poker à chaque session : la bankroll brute
  // sous-estime ce que le poker a rapporté dès qu'une partie en a été
  // dépensée hors-jeu -- ces frais (cumulés à la date de la session) sont
  // donc réintégrés ici, comme sur les tickets du carnet de bord.
  const winningsEntries = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((s) => ({
      id: s.id,
      date: new Date(s.date),
      amount: s.bankroll.total - INITIAL_BANKROLL + cumulativeFeesAsOf(s.date).total,
    }));
  }, [sessions]);

  const PLATFORMS = [
    { name: "Winamax", amount: currentBankroll.winamax },
    { name: "PokerStars", amount: currentBankroll.pokerstars },
    { name: "Unibet", amount: currentBankroll.unibet ?? 0 },
    { name: "PMU", amount: currentBankroll.pmu ?? 0 },
    { name: "Betclic", amount: currentBankroll.betclic ?? 0 },
    { name: "Porte-monnaie", amount: currentBankroll.wallet },
  ];

  const pnl = currentBankroll.total - INITIAL_BANKROLL;
  const pct = (pnl / INITIAL_BANKROLL) * 100;
  const isProfit = pnl >= 0;

  // Les frais hors-jeu (matériel, formation, tournois live...) sont DÉJÀ
  // prélevés sur la bankroll saisie : `currentBankroll.total` est donc déjà
  // le montant net. Les re-déduire ici les comptait deux fois. On affiche à
  // la place ce que serait la bankroll sans ces dépenses (frais réintégrés),
  // comme pour "Argent gagné au poker". Rattachés à la date de la dernière
  // session connue (celle qui donne `currentBankroll`).
  const latestSessionDate = sessions.length > 0 ? sessions[0].date : new Date().toISOString().split("T")[0];
  const fees = cumulativeFeesAsOf(latestSessionDate);
  const bankrollWithoutFees = currentBankroll.total + fees.total;

  // Les frais de même libellé (ex. plusieurs versements à la famille) sont
  // regroupés sur une seule ligne, datée du premier au dernier versement.
  const sortedFees = Object.values(
    [...POKER_FEES]
      .sort((a, b) => a.date.localeCompare(b.date))
      .reduce<Record<string, { label: string; amount: number; firstDate: string; lastDate: string }>>((acc, f) => {
        const g = acc[f.label];
        if (g) {
          g.amount += f.amount;
          g.lastDate = f.date;
        } else {
          acc[f.label] = { label: f.label, amount: f.amount, firstDate: f.date, lastDate: f.date };
        }
        return acc;
      }, {})
  ).sort((a, b) => a.firstDate.localeCompare(b.firstDate));
  const totalFees = sortedFees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Dashboard Bankroll</h1>
      </div>

      {!loaded ? (
        <PageLoader />
      ) : (
        <>
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
            {fees.total > 0 && (
              <div
                className="text-xs text-muted-foreground mt-1"
                title={fees.items.map((f) => `${f.label} (${f.amount}€)`).join(" · ")}
              >
                Sans les frais hors-jeu{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {bankrollWithoutFees.toLocaleString("fr-FR")}€
                </span>
              </div>
            )}
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

      {/* Frais hors-jeu */}
      {sortedFees.length > 0 && (
        <Card className="mb-10 overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-400/10 text-blue-400 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <CardTitle className="text-base">Frais hors-jeu</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Dépenses liées au poker mais pas au jeu lui-même -- déjà réintégrées dans l&apos;argent gagné affiché plus haut.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2.5">
              {sortedFees.map((fee, i) => {
                const Icon = feeIcon(fee.label);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{fee.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {fee.firstDate === fee.lastDate
                            ? format(parseISO(fee.firstDate), "d MMMM yyyy", { locale: fr })
                            : `Du ${format(parseISO(fee.firstDate), "d MMMM", { locale: fr })} au ${format(parseISO(fee.lastDate), "d MMMM yyyy", { locale: fr })}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-blue-400 shrink-0">
                      {fee.amount.toLocaleString("fr-FR")}€
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-xl font-bold tabular-nums text-blue-400">
                {totalFees.toLocaleString("fr-FR")}€
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="text-base">Évolution de la bankroll</CardTitle>
        </CardHeader>
        <CardContent>
          <BankrollChart entries={entries} referenceLine={500} />
        </CardContent>
      </Card>

      {/* Argent gagné au poker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Argent gagné au poker</CardTitle>
        </CardHeader>
        <CardContent>
          <BankrollChart entries={winningsEntries} referenceLine={0} label="Argent gagné" />
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
