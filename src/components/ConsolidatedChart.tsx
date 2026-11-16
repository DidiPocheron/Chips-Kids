"use client";

import { useId, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { buildConsolidatedSeries, type DatedValue } from "@/lib/consolidatedSeries";

const ACCENT = "#5B9FD4"; // bleu de la marque
// Avant cette date, les montants ne sont pas représentatifs (ex: tout début
// de suivi) -- on les exclut de la courbe plutôt que de fausser l'échelle.
const CHART_START_DATE = "2026-07-18";
const CARD_BG = "oklch(1 0 0)"; // --card -- valeur figée (un attribut SVG brut ne résout pas var())

interface Props {
  pokerPoints: DatedValue[];
  boursePoints: DatedValue[];
  cryptoPoints: DatedValue[];
  liveTotal: number;
  loaded: boolean;
}

function formatEuro(v: number): string {
  return `${v.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
}

function formatEuroPrecise(v: number): string {
  return `${v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

interface TooltipPayloadItem {
  payload: { date: string; total: number };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const label = format(parseISO(point.date), "d MMMM yyyy", { locale: fr });
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-0.5 rounded-full" style={{ backgroundColor: ACCENT }} />
        <span className="text-sm font-semibold tabular-nums text-foreground">{formatEuroPrecise(point.total)}</span>
      </div>
    </div>
  );
}

export function ConsolidatedChart({ pokerPoints, boursePoints, cryptoPoints, liveTotal, loaded }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `consolidatedGradient-${uid}`;

  const series = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return buildConsolidatedSeries(pokerPoints, boursePoints, cryptoPoints, { date: today, value: liveTotal }, CHART_START_DATE);
  }, [pokerPoints, boursePoints, cryptoPoints, liveTotal]);

  const hasEnoughData = series.length >= 2;

  const first = series[0];
  const last = series[series.length - 1];
  const delta = hasEnoughData ? last.total - first.total : 0;
  const pct = hasEnoughData && first.total > 0 ? (delta / first.total) * 100 : 0;
  const isUp = delta >= 0;

  // Choix de la granularité des étiquettes de l'axe X selon l'étendue réelle
  // de l'historique -- évite un axe "12 juin / 13 juin / 14 juin" illisible
  // quand les entrées sont rapprochées, ou un axe à une seule date quand
  // l'historique est jeune.
  const spanDays = hasEnoughData ? differenceInCalendarDays(parseISO(last.date), parseISO(first.date)) : 0;
  const xFormat = spanDays > 450 ? "MMM yy" : spanDays > 60 ? "d MMM" : "d MMM";

  const tickIndices = useMemo(() => {
    if (series.length <= 5) return series.map((_, i) => i);
    const count = 5;
    const step = (series.length - 1) / (count - 1);
    return Array.from({ length: count }, (_, i) => Math.round(i * step));
  }, [series]);

  if (!loaded) {
    return (
      <div className="h-[220px] rounded-3xl border border-border bg-card/50 flex items-center justify-center">
        <Spinner className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (!hasEnoughData) {
    return (
      <div className="h-[220px] rounded-3xl border border-border bg-card/50 flex items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Pas encore assez d&apos;historique pour afficher l&apos;évolution du total consolidé.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl border border-border p-5 sm:p-6 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${ACCENT}14, transparent 55%)` }}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Évolution du total consolidé
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0",
            isUp ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"
          )}
        >
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="tabular-nums">
            {isUp ? "+" : ""}{formatEuro(delta)} ({isUp ? "+" : ""}{pct.toFixed(1)}%)
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={series} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.28} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(0.2 0.05 40 / 7%)" />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => format(parseISO(d), xFormat, { locale: fr })}
            ticks={tickIndices.map((i) => series[i].date)}
            tick={{ fontSize: 11, fill: "oklch(0.52 0.03 55)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "oklch(0.52 0.03 55)" }}
            tickFormatter={(v: number) => formatEuro(v)}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke={ACCENT}
            strokeWidth={2}
            strokeLinecap="round"
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{ r: 5, fill: ACCENT, stroke: CARD_BG, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
