"use client";

import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { CryptoTicket } from "@/types";

const COIN_IDS: { key: keyof CryptoTicket["portfolio"]; coinId: string }[] = [
  { key: "bitcoin",  coinId: "bitcoin" },
  { key: "ethereum", coinId: "ethereum" },
  { key: "solana",   coinId: "solana" },
  { key: "ripple",   coinId: "ripple" },
];

interface ChartPoint {
  label: string;
  value: number;
  pnl: number | null;
}

function fmt(v: number) {
  return v.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
}

function tooltipStyle() {
  return {
    contentStyle: {
      backgroundColor: "oklch(0.17 0 0)",
      border: "1px solid oklch(1 0 0 / 10%)",
      borderRadius: "8px",
      fontSize: 12,
    },
    labelStyle: { color: "oklch(0.95 0 0)" },
  };
}

export function CryptoTicketCharts({ tickets }: { tickets: CryptoTicket[] }) {
  const points = useMemo<ChartPoint[]>(() => {
    return [...tickets]
      .filter(t => t.snapshotPrices)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(t => {
        const snap = t.snapshotPrices as Record<string, number | undefined>;
        let value = 0;
        let costBasis = 0;
        let hasCost = false;

        for (const { key, coinId } of COIN_IDS) {
          const qty = (t.portfolio[key] as number) || 0;
          const price = snap[coinId];
          const avg = (t.portfolio[`${key}Avg` as keyof typeof t.portfolio] as number | undefined) || 0;
          if (qty > 0 && price) value += qty * price;
          if (qty > 0 && avg > 0) { costBasis += qty * avg; hasCost = true; }
        }

        return {
          label: format(parseISO(t.date), "dd MMM yy", { locale: fr }),
          value: Math.round(value * 100) / 100,
          pnl: hasCost && value > 0 ? Math.round((value - costBasis) * 100) / 100 : null,
        };
      });
  }, [tickets]);

  if (points.length === 0) return null;

  const hasPnlData = points.some(p => p.pnl !== null);

  return (
    <div className="space-y-6">
      {/* Graphique valeur */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">Valeur du portefeuille (à la création de chaque ticket)</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={points} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cryptoValueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="oklch(0.65 0.18 255)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="oklch(0.65 0.18 255)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
            <YAxis tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} tickFormatter={fmt} domain={["auto", "auto"]} width={75} />
            <Tooltip {...tooltipStyle()} formatter={(v: number) => [fmt(v), "Valeur"]} />
            <Area type="monotone" dataKey="value" stroke="oklch(0.65 0.18 255)" strokeWidth={2} fill="url(#cryptoValueGrad)" dot={{ r: 4, fill: "oklch(0.65 0.18 255)" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique P&L */}
      {hasPnlData && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Gains / Pertes vs prix moyen d&apos;achat</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={points} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} tickFormatter={fmt} domain={["auto", "auto"]} width={75} />
              <Tooltip {...tooltipStyle()} formatter={(v: number) => [fmt(v), "P&L"]} />
              <ReferenceLine y={0} stroke="oklch(0.5 0 0)" strokeWidth={1} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {points.map((p, i) => (
                  <Cell key={i} fill={(p.pnl ?? 0) >= 0 ? "oklch(0.65 0.17 145)" : "oklch(0.55 0.22 25)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
