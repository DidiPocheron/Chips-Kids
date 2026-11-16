"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionStore } from "@/hooks/useSessionStore";
import { useBourseTicketStore } from "@/hooks/useBourseTicketStore";
import { useCryptoTicketStore } from "@/hooks/useCryptoTicketStore";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { usePortfolioStore } from "@/hooks/usePortfolioStore";
import { cn } from "@/lib/utils";
import { HIDE_POKER } from "@/lib/config";
import { AuthLock } from "@/components/auth/AuthLock";
import { Spinner } from "@/components/ui/spinner";
import { ConsolidatedChart } from "@/components/ConsolidatedChart";
import type { DatedValue } from "@/lib/consolidatedSeries";
import type { Easing } from "framer-motion";

const EASE_OUT: Easing = "easeOut";
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: EASE_OUT },
  }),
};

export default function HomePage() {
  const { sessions, currentBankroll, loaded: sessionsLoaded } = useSessionStore();
  const { tickets: bourseTickets, loaded: bourseLoaded } = useBourseTicketStore();
  const { tickets, loaded: cryptoTicketsLoaded } = useCryptoTicketStore();
  const { prices, loading: pricesLoading } = useCryptoPrices();
  const { entries: cryptoEntries, loaded: cryptoEntriesLoaded } = usePortfolioStore("portfolio_crypto");
  // Le montant crypto dépend à la fois des tickets (Firestore) et des cours
  // en direct (Kraken) : tant que l'un des deux n'est pas arrivé, le montant
  // calculé serait faux (basé sur un prix à 0) -- on attend les deux.
  const cryptoLoaded = cryptoTicketsLoaded && !pricesLoading;
  // Avec HIDE_POKER, les sessions poker ne comptent plus : inutile de les attendre.
  const pokerLoaded = HIDE_POKER || sessionsLoaded;
  const allLoaded = pokerLoaded && bourseLoaded && cryptoLoaded;
  // Le graphique d'évolution a sa propre condition de chargement : il a aussi
  // besoin de l'historique des entrées crypto manuelles (non requis pour le
  // gros chiffre "Total consolidé" ci-dessus).
  const chartLoaded = pokerLoaded && bourseLoaded && cryptoEntriesLoaded && cryptoLoaded;

  const bourse = useMemo(() => {
    if (bourseTickets.length === 0) return { currentAmount: 0, pnl: 0, invested: 0 };
    const sorted = [...bourseTickets].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    return {
      currentAmount: latest.ctPortfolioValue + latest.peaPortfolioValue,
      pnl: latest.ctPnl + latest.peaPnl,
      invested: latest.ctInvestedValue + latest.peaInvestedValue,
    };
  }, [bourseTickets]);

  const crypto = useMemo(() => {
    if (tickets.length === 0) return { currentAmount: 0, pnl: 0, invested: 0 };
    const latest = [...tickets].sort((a, b) => b.date.localeCompare(a.date))[0];
    const p = latest.portfolio;
    const rows = [
      { qty: p.bitcoin  || 0, avg: p.bitcoinAvg  || 0, price: prices.bitcoin  ?? 0 },
      { qty: p.ethereum || 0, avg: p.ethereumAvg || 0, price: prices.ethereum ?? 0 },
      { qty: p.solana   || 0, avg: p.solanaAvg   || 0, price: prices.solana   ?? 0 },
      { qty: p.ripple   || 0, avg: p.rippleAvg   || 0, price: prices.ripple   ?? 0 },
    ];
    const currentAmount = rows.reduce((s, r) => s + r.qty * r.price, 0);
    const invested = rows.reduce((s, r) => s + (r.avg > 0 ? r.qty * r.avg : 0), 0);
    return { currentAmount, pnl: invested > 0 ? currentAmount - invested : 0, invested };
  }, [tickets, prices]);

  // Séries datées pour le graphique d'évolution : chaque source garde sa
  // propre valeur réelle à sa propre date (voir src/lib/consolidatedSeries.ts).
  const pokerPoints: DatedValue[] = useMemo(
    () => (HIDE_POKER ? [] : sessions.map((s) => ({ date: s.date, value: s.bankroll.total }))),
    [sessions]
  );
  const boursePoints: DatedValue[] = useMemo(
    () => bourseTickets.map((t) => ({ date: t.date, value: t.ctPortfolioValue + t.peaPortfolioValue })),
    [bourseTickets]
  );
  const cryptoPoints: DatedValue[] = useMemo(
    () => cryptoEntries.map((e) => ({ date: e.date, value: e.amount })),
    [cryptoEntries]
  );

  // Bankroll poker exclue du total quand la partie poker est masquée.
  const pokerAmount = HIDE_POKER ? 0 : currentBankroll.total;
  const total = pokerAmount + bourse.currentAmount + crypto.currentAmount;

  const ALL_PORTFOLIOS = [
    {
      label: "Poker",
      href: "/bankroll",
      amount: currentBankroll.total,
      pnl: currentBankroll.total - 500,
      pct: 500 > 0 ? ((currentBankroll.total - 500) / 500) * 100 : 0,
      color: "text-primary",
      border: "border-primary/30",
      bg: "bg-primary/5",
      loaded: sessionsLoaded,
      links: [
        { href: "/bankroll", label: "Résultats" },
        { href: "/logbook", label: "Carnet de bord" },
        { href: "/bankroll-management", label: "BRM" },
      ],
    },
    {
      label: "Bourse",
      href: "/bourse",
      amount: bourse.currentAmount,
      pnl: bourse.pnl,
      pct: bourse.invested > 0 ? (bourse.pnl / bourse.invested) * 100 : 0,
      color: "text-blue-400",
      border: "border-blue-400/30",
      bg: "bg-blue-400/5",
      loaded: bourseLoaded,
      links: [
        { href: "/bourse", label: "Chiffres" },
        { href: "/bourse/logbook", label: "Carnet de bord" },
        { href: "/bourse/historique", label: "Historique CT" },
        { href: "/bourse/historique-pea", label: "Historique PEA" },
      ],
    },
    {
      label: "Crypto",
      href: "/crypto",
      amount: crypto.currentAmount,
      pnl: crypto.pnl,
      pct: crypto.invested > 0 ? (crypto.pnl / crypto.invested) * 100 : 0,
      color: "text-orange-400",
      border: "border-orange-400/30",
      bg: "bg-orange-400/5",
      loaded: cryptoLoaded,
      links: [
        { href: "/crypto", label: "Chiffres" },
        { href: "/crypto/logbook", label: "Carnet de bord" },
      ],
    },
  ];

  const PORTFOLIOS = ALL_PORTFOLIOS.filter((p) => !(HIDE_POKER && p.label === "Poker"));

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-10">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-1 tracking-tight">
          Les finances
        </h1>
        <p className="text-muted-foreground">Suivi de mes portefeuilles</p>
      </motion.div>

      {/* Total consolidé */}
      <motion.div initial="hidden" animate="visible" custom={0.05} variants={fadeUp} className="mb-10">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Total consolidé</div>
        <div className="text-5xl font-bold text-foreground tabular-nums flex items-center gap-3">
          {allLoaded ? (
            `${total.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`
          ) : (
            <Spinner className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
      </motion.div>

      {/* Évolution du total consolidé */}
      <motion.div initial="hidden" animate="visible" custom={0.08} variants={fadeUp} className="mb-8">
        <ConsolidatedChart
          pokerPoints={pokerPoints}
          boursePoints={boursePoints}
          cryptoPoints={cryptoPoints}
          liveTotal={total}
          loaded={chartLoaded}
        />
      </motion.div>

      {/* Grille des portefeuilles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PORTFOLIOS.map(({ label, href, amount, pnl, pct, color, border, bg, loaded, links }, i) => {
          const isUp = pnl >= 0;
          const hasData = amount > 0;
          const hasPnl = pnl !== 0 || pct !== 0;

          const isBourse = label === "Bourse";

          const body = (
            <>
              <div className="h-9 flex items-center mb-1">
                {loaded ? (
                  <div className="text-3xl font-bold tabular-nums">
                    {hasData ? `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€` : "—"}
                  </div>
                ) : (
                  <Spinner className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {loaded && hasData && hasPnl && (
                <div className={cn("flex items-center gap-1.5 text-sm", isUp ? "text-primary" : "text-destructive")}>
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{isUp ? "+" : ""}{pnl.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                  <span className="text-muted-foreground">({isUp ? "+" : ""}{pct.toFixed(1)}%)</span>
                </div>
              )}

              {links.length > 0 && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-border/50">
                  {links.map(l => (
                    <Link key={l.href} href={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </>
          );

          return (
            <motion.div key={label} initial="hidden" animate="visible" custom={0.1 + i * 0.05} variants={fadeUp}>
              <Card className={cn("border", border, bg, "hover:bg-card/80 transition-colors")}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={cn("text-sm font-semibold uppercase tracking-wider", color)}>{label}</span>
                    <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {isBourse ? <AuthLock>{body}</AuthLock> : body}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
