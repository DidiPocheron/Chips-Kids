"use client";

import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { CryptoTicket, CryptoPortfolio } from "@/types";

// Un seul graphique, une seule ligne : la quantité totale détenue, toutes
// cryptos confondues (le détail par crypto est dans l'infobulle).
//
// Pour additionner des BTC, des ETH, des SOL et des XRP, chaque quantité est
// convertie en "équivalent BTC" avec des ratios FIXES :
//
//   équivalent BTC = quantité × (prix de la crypto ÷ prix du BTC)
//
// Les prix de référence sont ceux du ticket le plus récent qui a des prix
// enregistrés, et ils sont appliqués à TOUS les tickets : la courbe ne bouge
// donc qu'avec les achats / ventes, pas avec les variations de cours.
type CoinKey = keyof Pick<CryptoPortfolio, "bitcoin" | "ethereum" | "solana" | "ripple">;

const COINS: { key: CoinKey; name: string; symbol: string; color: string }[] = [
  { key: "bitcoin",  name: "Bitcoin",  symbol: "BTC", color: "oklch(0.72 0.16 60)" },
  { key: "ethereum", name: "Ethereum", symbol: "ETH", color: "oklch(0.55 0.15 275)" },
  { key: "solana",   name: "Solana",   symbol: "SOL", color: "oklch(0.6 0.2 310)" },
  { key: "ripple",   name: "XRP",      symbol: "XRP", color: "oklch(0.6 0.12 230)" },
];

const TOTAL_COLOR = "oklch(0.72 0.16 60)";

interface Point {
  idx: number;
  rawDate: Date;
  label: string;
  qty: Record<CoinKey, number>; // quantités réelles
  eq: Record<CoinKey, number>;  // équivalent BTC
  bitcoin: number;              // équivalents BTC à plat pour recharts
  ethereum: number;
  solana: number;
  ripple: number;
  total: number;
}

function fmtQty(v: number) {
  return v.toLocaleString("fr-FR", { maximumFractionDigits: v >= 100 ? 0 : v >= 1 ? 2 : 6 });
}

function fmtBtc(v: number) {
  return v.toLocaleString("fr-FR", { maximumFractionDigits: 6 });
}

function QuantityTooltip({
  active,
  payload,
  coins,
}: {
  active?: boolean;
  payload?: { payload: Point }[];
  coins: typeof COINS;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs">
      <div className="text-muted-foreground mb-1.5">{p.label}</div>
      {[...coins].reverse().map((c) =>
        p.qty[c.key] > 0 ? (
          <div key={c.key} className="flex items-center justify-between gap-4 tabular-nums">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              {fmtQty(p.qty[c.key])} {c.symbol}
            </span>
            <span className="text-muted-foreground">≈ {fmtBtc(p.eq[c.key])} BTC</span>
          </div>
        ) : null
      )}
      <div className="flex justify-between gap-4 mt-1.5 pt-1.5 border-t border-border font-semibold tabular-nums">
        <span>Total</span>
        <span>{fmtBtc(p.total)} BTC</span>
      </div>
    </div>
  );
}

export function CryptoQuantityCharts({ tickets }: { tickets: CryptoTicket[] }) {
  const sorted = useMemo(() => [...tickets].sort((a, b) => a.date.localeCompare(b.date)), [tickets]);

  // Prix de référence : dernier ticket qui a un prix BTC enregistré.
  const ref = useMemo(() => {
    for (let i = sorted.length - 1; i >= 0; i--) {
      const s = sorted[i].snapshotPrices;
      if (s?.bitcoin) return { date: sorted[i].date, prices: s };
    }
    return null;
  }, [sorted]);

  const ratios = useMemo(() => {
    if (!ref) return null;
    const btc = ref.prices.bitcoin as number;
    const r = {} as Record<CoinKey, number | null>;
    for (const c of COINS) {
      const price = ref.prices[c.key];
      r[c.key] = price ? price / btc : null;
    }
    return r;
  }, [ref]);

  const coins = COINS.filter(
    (c) => ratios?.[c.key] != null && sorted.some((t) => (t.portfolio[c.key] || 0) > 0)
  );

  const points = useMemo<Point[]>(() => {
    if (!ratios) return [];
    return sorted.map((t, idx) => {
      const qty = {} as Record<CoinKey, number>;
      const eq = {} as Record<CoinKey, number>;
      let total = 0;
      for (const c of COINS) {
        qty[c.key] = t.portfolio[c.key] || 0;
        eq[c.key] = qty[c.key] * (ratios[c.key] ?? 0);
        total += eq[c.key];
      }
      return {
        idx,
        rawDate: parseISO(t.date),
        label: format(parseISO(t.date), "d MMMM yyyy", { locale: fr }),
        qty,
        eq,
        ...eq,
        total,
      };
    });
  }, [sorted, ratios]);

  if (!ref || !ratios || points.length === 0 || coins.length === 0) return null;

  // Axe des mois commun aux autres graphiques.
  const multiYear = points[0].rawDate.getFullYear() !== points[points.length - 1].rawDate.getFullYear();
  const monthStarts: number[] = [];
  points.forEach((p, i) => {
    const prev = points[i - 1];
    if (!prev || prev.rawDate.getMonth() !== p.rawDate.getMonth() || prev.rawDate.getFullYear() !== p.rawDate.getFullYear()) {
      monthStarts.push(p.idx);
    }
  });
  const monthLabel = (idx: number) => {
    const d = points[idx]?.rawDate;
    if (!d) return "";
    const m = format(d, "LLLL", { locale: fr });
    const cap = m.charAt(0).toUpperCase() + m.slice(1);
    return multiYear && d.getMonth() === 0 ? `${cap} ${d.getFullYear()}` : cap;
  };

  const last = points[points.length - 1];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">Total en équivalent BTC</p>
        <p className="text-sm font-semibold tabular-nums">{fmtBtc(last.total)} BTC</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={points} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
          <XAxis
            dataKey="idx"
            ticks={monthStarts}
            interval={0}
            tickFormatter={(v) => monthLabel(Number(v))}
            tick={{ fontSize: 11, fill: "oklch(0.6 0 0)", textAnchor: "start" }}
          />
          {monthStarts.map((i) => (
            <ReferenceLine key={`month-${i}`} x={i} stroke="oklch(0.6 0 0 / 60%)" strokeDasharray="4 4" />
          ))}
          <YAxis
            tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
            tickFormatter={(v) => fmtBtc(Number(v))}
            domain={[0, "auto"]}
            width={70}
          />
          <Tooltip content={<QuantityTooltip coins={coins} />} />
          <defs>
            <linearGradient id="qtyTotalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={TOTAL_COLOR} stopOpacity={0.3} />
              <stop offset="95%" stopColor={TOTAL_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="stepAfter"
            dataKey="total"
            stroke={TOTAL_COLOR}
            strokeWidth={2}
            fill="url(#qtyTotalGrad)"
            dot={{ r: 3, fill: TOTAL_COLOR }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Ratios utilisés pour la conversion */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        {coins.map((c) => (
          c.key !== "bitcoin" && (
            <span key={c.key} className="tabular-nums">
              1 {c.symbol} = {fmtBtc(ratios[c.key] as number)} BTC
            </span>
          )
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Ratios fixes calculés avec les prix du {format(parseISO(ref.date), "d MMMM yyyy", { locale: fr })}{" "}
        (prix de la crypto ÷ prix du BTC) : la courbe ne varie qu&apos;avec les achats et ventes, pas avec les cours.
      </p>
    </div>
  );
}
