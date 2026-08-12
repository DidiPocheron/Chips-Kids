"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionStore } from "@/hooks/useSessionStore";
import { usePortfolioStore } from "@/hooks/usePortfolioStore";
import { useBourseTicketStore } from "@/hooks/useBourseTicketStore";
import { useCryptoTicketStore } from "@/hooks/useCryptoTicketStore";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { cn } from "@/lib/utils";
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
  const { currentBankroll } = useSessionStore();
  const trading = usePortfolioStore("portfolio_trading");
  const { tickets: bourseTickets } = useBourseTicketStore();
  const { tickets } = useCryptoTicketStore();
  const { prices } = useCryptoPrices();

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

  const total = currentBankroll.total + bourse.currentAmount + crypto.currentAmount + trading.currentAmount;

  const PORTFOLIOS = [
    {
      label: "Poker",
      href: "/bankroll",
      amount: currentBankroll.total,
      pnl: currentBankroll.total - 500,
      pct: 500 > 0 ? ((currentBankroll.total - 500) / 500) * 100 : 0,
      color: "text-primary",
      border: "border-primary/30",
      bg: "bg-primary/5",
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
      links: [
        { href: "/crypto", label: "Chiffres" },
        { href: "/crypto/logbook", label: "Carnet de bord" },
      ],
    },
    {
      label: "Trading",
      href: "/trading",
      amount: trading.currentAmount,
      pnl: trading.currentAmount - trading.firstAmount,
      pct: trading.firstAmount > 0 ? ((trading.currentAmount - trading.firstAmount) / trading.firstAmount) * 100 : 0,
      color: "text-purple-400",
      border: "border-purple-400/30",
      bg: "bg-purple-400/5",
      links: [
        { href: "/trading", label: "Chiffres" },
        { href: "/trading/strategie", label: "Stratégie" },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-10">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-1 tracking-tight">
          Chips <span className="text-[#5B9FD4]">&</span> Trade
        </h1>
        <p className="text-muted-foreground">Suivi de mes portefeuilles</p>
      </motion.div>

      {/* Total consolidé */}
      <motion.div initial="hidden" animate="visible" custom={0.05} variants={fadeUp} className="mb-10">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Total consolidé</div>
        <div className="text-5xl font-bold text-foreground tabular-nums">
          {total.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
        </div>
      </motion.div>

      {/* Grille des portefeuilles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PORTFOLIOS.map(({ label, href, amount, pnl, pct, color, border, bg, links }, i) => {
          const isUp = pnl >= 0;
          const hasData = amount > 0;
          const hasPnl = pnl !== 0 || pct !== 0;

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

                  <div className="text-3xl font-bold tabular-nums mb-1">
                    {hasData ? `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€` : "—"}
                  </div>

                  {hasData && hasPnl && (
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
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
