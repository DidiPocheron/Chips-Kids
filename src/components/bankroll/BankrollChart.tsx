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

interface Props {
  entries: BankrollEntry[];
  referenceLine?: number;
}

export function BankrollChart({ entries, referenceLine }: Props) {
  const data = entries.map((e) => ({
    date: format(e.date, "dd/MM", { locale: fr }),
    amount: e.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="bankrollGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.72 0.17 145)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="oklch(0.72 0.17 145)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} />
        <YAxis
          tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
          tickFormatter={(v) => `${Number(v).toLocaleString("fr-FR")}€`}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "oklch(0.17 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "8px" }}
          labelStyle={{ color: "oklch(0.95 0 0)", fontSize: 12 }}
          formatter={(value) => value != null ? [`${Number(value).toLocaleString("fr-FR")}€`, "Bankroll"] : []}
        />
        {referenceLine !== undefined && (
          <ReferenceLine y={referenceLine} stroke="oklch(0.6 0 0)" strokeDasharray="4 4" label={{ value: `${referenceLine}€`, fill: "oklch(0.6 0 0)", fontSize: 11 }} />
        )}
        <Area
          type="monotone"
          dataKey="amount"
          stroke="oklch(0.72 0.17 145)"
          strokeWidth={2}
          fill="url(#bankrollGradient)"
          dot={{ r: 3, fill: "oklch(0.72 0.17 145)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
