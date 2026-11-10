"use client";

import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
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
  idx: number;
  rawDate: Date;
  label: string;
  value: number;
  pnl: number | null;
}

const PNL_POSITIVE = "oklch(0.65 0.17 145)";
const PNL_NEGATIVE = "oklch(0.55 0.22 25)";

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

function renderPnlDot(props: { cx?: number; cy?: number; payload?: ChartPoint; index?: number }) {
  const { cx, cy, payload, index } = props;
  if (cx === undefined || cy === undefined || !payload || payload.pnl === null) {
    return <g key={`pnl-dot-${index}`} />;
  }
  const color = payload.pnl >= 0 ? PNL_POSITIVE : PNL_NEGATIVE;
  return <circle key={`pnl-dot-${index}`} cx={cx} cy={cy} r={4} fill={color} />;
}

export function CryptoTicketCharts({ tickets }: { tickets: CryptoTicket[] }) {
  const points = useMemo<ChartPoint[]>(() => {
    return [...tickets]
      .filter(t => t.snapshotPrices)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((t, idx) => {
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
          idx,
          rawDate: parseISO(t.date),
          label: format(parseISO(t.date), "dd MMM yy", { locale: fr }),
          value: Math.round(value * 100) / 100,
          pnl: hasCost && value > 0 ? Math.round((value - costBasis) * 100) / 100 : null,
        };
      });
  }, [tickets]);

  if (points.length === 0) return null;

  const hasPnlData = points.some(p => p.pnl !== null);

  // Axe des abscisses : tous les points restent, mais un seul libellé par mois
  // (sur le premier ticket du mois) + un trait vertical en pointillé.
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
  const tooltipLabel = (idx: unknown) => points[Number(idx)]?.label ?? "";
  const monthAxis = (
    <XAxis
      dataKey="idx"
      ticks={monthStarts}
      interval={0}
      tickFormatter={(v) => monthLabel(Number(v))}
      tick={{ fontSize: 11, fill: "oklch(0.6 0 0)", textAnchor: "start" }}
    />
  );
  const monthLines = monthStarts.map((i) => (
    <ReferenceLine key={`month-${i}`} x={i} stroke="oklch(0.6 0 0 / 60%)" strokeDasharray="4 4" />
  ));

  // Position (en %) de la ligne de zéro dans le dégradé, pour que la courbe et son
  // remplissage passent du vert (positif) au rouge (négatif) exactement à la bonne hauteur.
  const pnlValues = points.map(p => p.pnl).filter((v): v is number => v !== null);
  const pnlMax = pnlValues.length ? Math.max(0, ...pnlValues) : 0;
  const pnlMin = pnlValues.length ? Math.min(0, ...pnlValues) : 0;
  const pnlSpan = pnlMax - pnlMin;
  const zeroOffset = pnlSpan > 0 ? pnlMax / pnlSpan : 0.5;

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
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
            {monthAxis}
            {monthLines}
            <YAxis tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} tickFormatter={fmt} domain={["auto", "auto"]} width={75} />
            <Tooltip {...tooltipStyle()} formatter={(v) => [fmt(Number(v)), "Valeur"]} labelFormatter={tooltipLabel} />
            <Area type="monotone" dataKey="value" stroke="oklch(0.65 0.18 255)" strokeWidth={2} fill="url(#cryptoValueGrad)" dot={{ r: 4, fill: "oklch(0.65 0.18 255)" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique P&L */}
      {hasPnlData && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Gains / Pertes vs prix moyen d&apos;achat</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={points} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cryptoPnlFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={0} stopColor={PNL_POSITIVE} stopOpacity={0.32} />
                  <stop offset={zeroOffset} stopColor={PNL_POSITIVE} stopOpacity={0.32} />
                  <stop offset={zeroOffset} stopColor={PNL_NEGATIVE} stopOpacity={0.32} />
                  <stop offset={1} stopColor={PNL_NEGATIVE} stopOpacity={0.32} />
                </linearGradient>
                <linearGradient id="cryptoPnlStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={0} stopColor={PNL_POSITIVE} />
                  <stop offset={zeroOffset} stopColor={PNL_POSITIVE} />
                  <stop offset={zeroOffset} stopColor={PNL_NEGATIVE} />
                  <stop offset={1} stopColor={PNL_NEGATIVE} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
              {monthAxis}
              {monthLines}
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
                tickFormatter={fmt}
                domain={[(dataMin: number) => Math.min(0, dataMin), (dataMax: number) => Math.max(0, dataMax)]}
                width={75}
              />
              <Tooltip {...tooltipStyle()} formatter={(v) => [fmt(Number(v)), "P&L"]} labelFormatter={tooltipLabel} />
              <ReferenceLine y={0} stroke="oklch(0.5 0 0)" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="url(#cryptoPnlStroke)"
                strokeWidth={2}
                fill="url(#cryptoPnlFill)"
                dot={renderPnlDot}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
