"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { BankrollEntry } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useId } from "react";

interface Props {
  entries: BankrollEntry[];
  referenceLine?: number;
  color?: string;
  label?: string;
}

const GREEN = "oklch(0.72 0.17 145)";
const RED = "oklch(0.55 0.22 25)";

export function BankrollChart({ entries, referenceLine, color = GREEN, label = "Bankroll" }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `bankrollGradient-${uid}`;
  const strokeSplitId = `bankrollStrokeSplit-${uid}`;
  const fillSplitId = `bankrollFillSplit-${uid}`;

  const data = entries.map((e) => ({
    date: format(e.date, "dd/MM", { locale: fr }),
    amount: e.amount,
  }));

  const hasThreshold = referenceLine !== undefined;
  const values = data.map((d) => d.amount);
  const rawMin = Math.min(...values, ...(hasThreshold ? [referenceLine as number] : []));
  const rawMax = Math.max(...values, ...(hasThreshold ? [referenceLine as number] : []));
  const span = Math.max(rawMax - rawMin, 1);
  const pad = span * 0.1;
  const domainMin = rawMin - pad;
  const domainMax = rawMax + pad;
  const offset = hasThreshold
    ? Math.min(1, Math.max(0, (domainMax - (referenceLine as number)) / (domainMax - domainMin)))
    : 1;

  const renderDot = (props: { cx?: number; cy?: number; payload?: { amount?: number } }) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined) return <></>;
    const amount = payload?.amount ?? 0;
    const color = hasThreshold && amount < (referenceLine as number) ? RED : GREEN;
    return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill={color} stroke="none" />;
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {hasThreshold ? (
            <>
              <linearGradient id={strokeSplitId} x1="0" y1="0" x2="0" y2="1">
                <stop offset={offset} stopColor={GREEN} />
                <stop offset={offset} stopColor={RED} />
              </linearGradient>
              <linearGradient id={fillSplitId} x1="0" y1="0" x2="0" y2="1">
                <stop offset={0} stopColor={GREEN} stopOpacity={0.35} />
                <stop offset={offset} stopColor={GREEN} stopOpacity={0.08} />
                <stop offset={offset} stopColor={RED} stopOpacity={0.08} />
                <stop offset={1} stopColor={RED} stopOpacity={0.35} />
              </linearGradient>
            </>
          ) : (
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
        <YAxis
          tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
          tickFormatter={(v) => `${Number(v).toLocaleString("fr-FR")}€`}
          domain={hasThreshold ? [domainMin, domainMax] : ["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "oklch(0.17 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "8px" }}
          labelStyle={{ color: "oklch(0.95 0 0)", fontSize: 12 }}
          formatter={(value) => value != null ? [`${Number(value).toLocaleString("fr-FR")}€`, label] : []}
        />
        {hasThreshold && (
          <ReferenceLine y={referenceLine} stroke="oklch(0.6 0 0)" strokeDasharray="4 4" label={{ value: `${referenceLine}€`, fill: "oklch(0.6 0 0)", fontSize: 11 }} />
        )}
        <Area
          type="monotone"
          dataKey="amount"
          stroke={hasThreshold ? `url(#${strokeSplitId})` : color}
          strokeWidth={2}
          fill={hasThreshold ? `url(#${fillSplitId})` : `url(#${gradId})`}
          dot={hasThreshold ? renderDot : { r: 3, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
