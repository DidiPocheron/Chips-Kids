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

interface ChartTooltipPayloadItem {
  payload: { rawDate: Date; amount: number };
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const dateLabel = format(point.rawDate, "d MMMM yyyy", { locale: fr });
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <div className="text-[11px] text-muted-foreground mb-1">{dateLabel}</div>
      <div className="text-sm font-semibold tabular-nums text-foreground">
        {point.amount.toLocaleString("fr-FR")}€
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function BankrollChart({ entries, referenceLine, color = GREEN, label = "Bankroll" }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `bankrollGradient-${uid}`;
  const strokeSplitId = `bankrollStrokeSplit-${uid}`;
  const fillSplitId = `bankrollFillSplit-${uid}`;

  const data = entries.map((e, idx) => ({
    idx,
    rawDate: e.date,
    amount: e.amount,
  }));

  // Axe des abscisses : on garde tous les points, mais on n'affiche qu'un
  // libellé par mois, placé sur le premier point de ce mois, avec un trait
  // vertical en pointillé pour marquer le début du mois.
  const multiYear =
    data.length > 0 &&
    data[0].rawDate.getFullYear() !== data[data.length - 1].rawDate.getFullYear();
  const monthStarts: number[] = [];
  data.forEach((d, i) => {
    const prev = data[i - 1];
    if (
      !prev ||
      prev.rawDate.getMonth() !== d.rawDate.getMonth() ||
      prev.rawDate.getFullYear() !== d.rawDate.getFullYear()
    ) {
      monthStarts.push(d.idx);
    }
  });
  const monthLabel = (idx: number) => {
    const d = data[idx]?.rawDate;
    if (!d) return "";
    const m = format(d, "LLLL", { locale: fr });
    const cap = m.charAt(0).toUpperCase() + m.slice(1);
    return multiYear && d.getMonth() === 0 ? `${cap} ${d.getFullYear()}` : cap;
  };

  const hasThreshold = referenceLine !== undefined;
  const values = data.map((d) => d.amount);
  const rawMin = Math.min(...values, ...(hasThreshold ? [referenceLine as number] : []));
  const rawMax = Math.max(...values, ...(hasThreshold ? [referenceLine as number] : []));
  const span = Math.max(rawMax - rawMin, 1);
  const pad = span * 0.1;
  const domainMin = rawMin - pad;
  const domainMax = rawMax + pad;

  // Les dégradés stroke/fill ci-dessous utilisent gradientUnits="objectBoundingBox"
  // (le défaut en SVG) : leurs offsets 0..1 sont relatifs à la bounding box de
  // CHAQUE élément dessiné, pas au domaine (avec marge) de l'axe Y. Or la ligne
  // (stroke) et l'aire remplie (fill) n'ont pas la même bounding box verticale :
  // - la ligne colle exactement aux données, donc sa bounding box va de rawMin à rawMax
  // - l'aire descend jusqu'à sa base, fixée explicitement à domainMin via `baseValue`
  //   sur <Area>, donc sa bounding box va de rawMax à domainMin
  // Utiliser un seul "offset" basé sur le domaine avec marge (domainMin/domainMax)
  // pour les deux désynchronisait la couleur de la ligne/aire de celle des points
  // (qui, eux, sont coloriés directement à partir de leur valeur réelle) -- d'où le
  // bug "les points sont verts mais pas la ligne ni l'aire" dans les zones positives.
  const strokeOffset = hasThreshold
    ? Math.min(1, Math.max(0, (rawMax - (referenceLine as number)) / span))
    : 1;
  const fillSpan = Math.max(rawMax - domainMin, 1);
  const fillOffset = hasThreshold
    ? Math.min(1, Math.max(0, (rawMax - (referenceLine as number)) / fillSpan))
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
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 4, bottom: 0 }}>
        <defs>
          {hasThreshold ? (
            <>
              <linearGradient id={strokeSplitId} x1="0" y1="0" x2="0" y2="1">
                <stop offset={strokeOffset} stopColor={GREEN} />
                <stop offset={strokeOffset} stopColor={RED} />
              </linearGradient>
              <linearGradient id={fillSplitId} x1="0" y1="0" x2="0" y2="1">
                <stop offset={0} stopColor={GREEN} stopOpacity={0.35} />
                <stop offset={fillOffset} stopColor={GREEN} stopOpacity={0.08} />
                <stop offset={fillOffset} stopColor={RED} stopOpacity={0.08} />
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
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
        <XAxis
          dataKey="idx"
          ticks={monthStarts}
          interval={0}
          tickFormatter={(v) => monthLabel(Number(v))}
          tick={{ fontSize: 11, fill: "oklch(0.6 0 0)", textAnchor: "start" }}
        />
        {monthStarts.map((i) => (
          <ReferenceLine
            key={`month-${i}`}
            x={i}
            stroke="oklch(0.6 0 0 / 60%)"
            strokeDasharray="4 4"
          />
        ))}
        <YAxis
          tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
          tickFormatter={(v) => `${Number(v).toLocaleString("fr-FR")}€`}
          domain={hasThreshold ? [domainMin, domainMax] : ["auto", "auto"]}
          width={72}
        />
        <Tooltip content={<ChartTooltip label={label} />} />
        {hasThreshold && (
          <ReferenceLine
            y={referenceLine}
            stroke="oklch(0.6 0 0)"
            strokeDasharray="4 4"
            label={{ value: `${referenceLine}€`, position: "insideBottomLeft", fill: "oklch(0.6 0 0)", fontSize: 11 }}
          />
        )}
        <Area
          type="monotone"
          dataKey="amount"
          baseValue={hasThreshold ? domainMin : undefined}
          stroke={hasThreshold ? `url(#${strokeSplitId})` : color}
          strokeWidth={2}
          fill={hasThreshold ? `url(#${fillSplitId})` : `url(#${gradId})`}
          dot={hasThreshold ? renderDot : { r: 3, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
