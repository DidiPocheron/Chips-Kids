"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Coins } from "lucide-react";
import {
  AreaChart, Area,
  BarChart, Bar,
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// ── Data ──────────────────────────────────────────────────────────────────────

const PORTFOLIO_VALUES = [
  { period: "Déc 2019", value: 576.58, annual: true },
  { period: "Déc 2020", value: 5272.83, annual: true },
  { period: "Déc 2021", value: 8267.21, annual: true },
  { period: "Déc 2022", value: 6536.34, annual: true },
  { period: "Jun 2023", value: 6950.85, annual: false },
  { period: "Sep 2023", value: 6977.27, annual: false },
  { period: "Déc 2023", value: 10318.72, annual: false },
  { period: "Mar 2024", value: 12477.26, annual: false },
  { period: "Jun 2024", value: 12851.32, annual: false },
  { period: "Sep 2024", value: 12676.73, annual: false },
  { period: "Déc 2024", value: 14755.78, annual: false },
  { period: "Mar 2025", value: 14525.35, annual: false },
  { period: "Jun 2025", value: 22136.06, annual: false },
  { period: "Sep 2025", value: 22477.10, annual: false },
  { period: "Déc 2025", value: 25743.45, annual: false },
  { period: "Mar 2026", value: 27154.21, annual: false },
  { period: "Jun 2026", value: 25316.66, annual: false },
];

const ANNUAL = [
  { year: "2019", realise: 0,     dividendes: 2,   frais: 23,  perf: 27,    portfolio: 577 },
  { year: "2020", realise: 776,   dividendes: 59,  frais: 215, perf: 1598,  portfolio: 5273 },
  { year: "2021", realise: 662,   dividendes: 111, frais: 104, perf: 2883,  portfolio: 8267 },
  { year: "2022", realise: 2253,  dividendes: 235, frais: 125, perf: 405,   portfolio: 6536 },
  { year: "2023", realise: -68,   dividendes: 241, frais: 132, perf: 674,   portfolio: 10319 },
  { year: "2024", realise: 275,   dividendes: 357, frais: 225, perf: 875,   portfolio: 14756 },
  { year: "2025", realise: -73,   dividendes: 499, frais: null, perf: null, portfolio: 26616 },
];

const YEARLY_FLOWS = [
  { year: "2020", deposits: 0,      withdrawals: 0 },
  { year: "2021", deposits: 2000,   withdrawals: 0 },
  { year: "2022", deposits: 0,      withdrawals: -1526 },
  { year: "2023", deposits: 3000,   withdrawals: -500 },
  { year: "2024", deposits: 4904,   withdrawals: -1350 },
  { year: "2025", deposits: 11650,  withdrawals: -638 },
  { year: "2026", deposits: 0,      withdrawals: -5374 },
];

const EVENTS: { date: string; icon: string; title: string; description: string; type: "positive" | "negative" | "deposit" | "withdrawal" | "neutral" }[] = [
  {
    date: "2019",
    icon: "🏦",
    title: "Ouverture du compte — Premiers small caps",
    description: "Compte flatexDEGIRO ouvert avec une approche value / small caps internationaux. Positions sur Great Eagle (HK), Melcor (CA), Fukuvi (JP), Nissin Fudosan (JP). Portefeuille à 577€ fin d'année.",
    type: "neutral",
  },
  {
    date: "2020",
    icon: "🚀",
    title: "Excellente année : +1 598€ de performance nette",
    description: "Gains records. Top performers : Westell Technologies +378€, Parrot +197€, McCarthy +95€, Allied Healthcare +117€. Dividendes : 59€. Le portefeuille bondit de 577€ → 5 273€.",
    type: "positive",
  },
  {
    date: "Mai 2021",
    icon: "💰",
    title: "Premier virement significatif : +2 000€",
    description: "Premier grand apport de capital depuis Fortuneo. Nouvelles positions : Dillard's (+218€ réalisé), IRCE (+183€), Goodfellow (+247€).",
    type: "deposit",
  },
  {
    date: "2021",
    icon: "📈",
    title: "Portefeuille au pic 2021 : 8 267€ (+2 883€ perf)",
    description: "Bonne année globale. Plusieurs valeurs vendues avec profit. Dividendes en hausse : 111€. Le portefeuille dépasse 8 000€.",
    type: "positive",
  },
  {
    date: "2022",
    icon: "💸",
    title: "Meilleure année de cessions : +2 253€ réalisés",
    description: "Prises de profits importantes malgré la baisse des marchés. Civeo Corp +528€, Mutual Corp +547€, Prairiesky Royalty +501€, Hornbach +165€. Retrait de 1 526€ vers Fortuneo.",
    type: "positive",
  },
  {
    date: "Fin 2022",
    icon: "⬇️",
    title: "Portefeuille recule à 6 536€",
    description: "La valeur de marché baisse malgré les bonnes cessions — les marchés 2022 ont pesé sur les positions conservées.",
    type: "negative",
  },
  {
    date: "2023",
    icon: "🔄",
    title: "Première année de pertes réalisées : -68€",
    description: "Hexaom -135€, Gigamedia -74€, Plast.Val Loire -57€. Mais ADF Group +156€, Trilogiq +39€ limitent la casse. 3 000€ réinvestis (6 × 500€). Dividendes : 241€.",
    type: "neutral",
  },
  {
    date: "Déc 2023",
    icon: "📦",
    title: "Portefeuille dépasse 10 000€ pour la première fois",
    description: "Grâce aux nouveaux apports et à la bonne tenue des positions japonaises, le portefeuille atteint 10 319€.",
    type: "positive",
  },
  {
    date: "2024",
    icon: "💰",
    title: "Apports importants : +4 904€",
    description: "Dividendes record : 357€. Dundee Precious Metals +376€. Nouveaux achats : Crest Nicholson (GB), Nippon Seiki (JP), Wakita (JP), Yamaha Motor (JP). Portefeuille : 14 756€.",
    type: "deposit",
  },
  {
    date: "Avr 2025",
    icon: "🚀",
    title: "Réinvestissement massif : +7 250€",
    description: "6 virements en 3 semaines. De nouvelles lignes japonaises ouvrent massivement : Pillar Corp, Keihin, Japan Petroleum Exploration, Tsubakimoto Kogyo.",
    type: "deposit",
  },
  {
    date: "Jun 2025",
    icon: "📈",
    title: "Portefeuille bondit à 22 136€ (+52% en un trimestre)",
    description: "Les nouvelles positions japonaises performent fort. Pillar Corp représente seul plus de 2 000€. Dividendes en hausse accélérée.",
    type: "positive",
  },
  {
    date: "Q4 2025",
    icon: "💰",
    title: "Nouveaux apports : +4 400€ — Dividendes records : 499€",
    description: "4 virements en oct-nov. Le portefeuille dépasse 25 000€. Les dividendes annuels atteignent 499€ — un nouveau record personnel.",
    type: "deposit",
  },
  {
    date: "Mar 2026",
    icon: "⭐",
    title: "Pic historique : 27 154€",
    description: "Valeur maximale atteinte du portefeuille. Nouvelles lignes : Tazmo, KOA Shoji, Maruzen, Nichia Steel, Petrotal Corp (CA), Nisso Group (JP).",
    type: "positive",
  },
  {
    date: "Avr–Jun 2026",
    icon: "↩️",
    title: "Retraits progressifs : -5 374€",
    description: "Ventes partielles et nombreux retraits vers Fortuneo. Malgré les sorties, le portefeuille reste à 25 317€.",
    type: "withdrawal",
  },
];

// ── Utils ──────────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return v.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
}

const TS = {
  contentStyle: {
    backgroundColor: "oklch(0.17 0 0)",
    border: "1px solid oklch(1 0 0 / 10%)",
    borderRadius: "8px",
    fontSize: 12,
  },
  labelStyle: { color: "oklch(0.95 0 0)" },
};

const EVENT_BORDER: Record<string, string> = {
  positive: "border-blue-400/40 bg-blue-400/5",
  negative: "border-destructive/40 bg-destructive/5",
  deposit: "border-primary/40 bg-primary/5",
  withdrawal: "border-orange-400/40 bg-orange-400/5",
  neutral: "border-border bg-card/50",
};
const EVENT_DOT: Record<string, string> = {
  positive: "bg-blue-400",
  negative: "bg-destructive",
  deposit: "bg-primary",
  withdrawal: "bg-orange-400",
  neutral: "bg-muted-foreground",
};

// ── Page ───────────────────────────────────────────────────────────────────────

const INITIAL_DEPOSIT_2019 = 549; // estimé : portfolio fin 2019 (577) − perf (27) − div (2)
const PORTFOLIO_CURRENT = 25316.66;

export default function BourseHistoriquePage() {
  const totalRealise = ANNUAL.reduce((s, y) => s + y.realise, 0);
  const totalDividendes = ANNUAL.reduce((s, y) => s + y.dividendes, 0);
  const totalDeposits = YEARLY_FLOWS.reduce((s, y) => s + y.deposits, 0) + INITIAL_DEPOSIT_2019;
  const totalWithdrawals = Math.abs(YEARLY_FLOWS.reduce((s, y) => s + y.withdrawals, 0));
  const pnlEconomique = 10272;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Link
        href="/bourse"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au portefeuille
      </Link>

      {/* ── Header ── */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-medium mb-4">
          <Calendar className="w-3.5 h-3.5" />
          Avant le début du suivi
        </div>
        <h1 className="text-3xl font-bold mb-2">Historique Bourse — 2019 à 2026</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          7 ans d&apos;investissement sur DEGIRO avant le lancement de ce blog.
          Données extraites de <strong className="text-foreground">rapports annuels</strong>, relevés de frais et{" "}
          <strong className="text-foreground">relevés trimestriels d&apos;instruments</strong> (2019–2026).
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground mb-2">Valeur actuelle</div>
            <div className="text-xl font-bold text-blue-400 tabular-nums">{fmt(25316.66)}</div>
            <div className="text-xs text-muted-foreground mt-1">Jun 2026</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground mb-2">Pic historique</div>
            <div className="text-xl font-bold text-primary tabular-nums">{fmt(27154.21)}</div>
            <div className="text-xs text-muted-foreground mt-1">Mar 2026</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground mb-2">P&L économique</div>
            <div className={cn("text-xl font-bold tabular-nums", pnlEconomique >= 0 ? "text-primary" : "text-destructive")}>
              {pnlEconomique >= 0 ? "+" : ""}{fmt(pnlEconomique)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">portefeuille + retraits − dépôts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground mb-2">Dont dividendes reçus</div>
            <div className="text-xl font-bold text-amber-400 tabular-nums">+{fmt(totalDividendes)}</div>
            <div className="text-xs text-muted-foreground mt-1">bruts cumulés</div>
          </CardContent>
        </Card>
      </div>

      {/* ── Portfolio value chart ── */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Évolution de la valeur du portefeuille</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Valeur de marché totale des positions. Annuelle 2019–2022, trimestrielle 2023–2026.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400 tabular-nums">{fmt(25316.66)}</div>
              <div className="text-xs text-muted-foreground">au 30 juin 2026</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={PORTFOLIO_VALUES} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="oklch(0.65 0.18 255)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="oklch(0.65 0.18 255)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
              <XAxis dataKey="period" tick={{ fontSize: 9, fill: "oklch(0.55 0 0)" }} interval={1} angle={-30} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }} tickFormatter={fmt} domain={[0, "auto"]} width={90} />
              <Tooltip {...TS} formatter={(v) => [fmt(Number(v)), "Portefeuille"]} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.65 0.18 255)"
                strokeWidth={2}
                fill="url(#portGrad)"
                dot={{ r: 3, fill: "oklch(0.65 0.18 255)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Annual P&L charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Realized gains/losses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Gains & pertes de cessions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ANNUAL} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }} tickFormatter={v => fmt(Math.abs(v))} domain={["auto", "auto"]} width={75} />
                <Tooltip {...TS} formatter={(v) => { const n = Number(v); return [`${n >= 0 ? "+" : ""}${fmt(n)}`, "Réalisé"]; }} />
                <ReferenceLine y={0} stroke="oklch(0.45 0 0)" />
                <Bar dataKey="realise" radius={[4, 4, 0, 0]}>
                  {ANNUAL.map((d, i) => (
                    <Cell key={i} fill={d.realise >= 0 ? "oklch(0.72 0.17 145)" : "oklch(0.55 0.22 25)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              Total net 2019–2025 : <strong className="text-primary">+{fmt(totalRealise)}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Dividends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dividendes bruts annuels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ANNUAL} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }} tickFormatter={fmt} domain={[0, "auto"]} width={75} />
                <Tooltip {...TS} formatter={(v) => [fmt(Number(v)), "Dividendes bruts"]} />
                <Bar dataKey="dividendes" fill="oklch(0.78 0.15 85)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              Total cumulé : <strong className="text-amber-400">+{fmt(totalDividendes)}</strong> bruts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Annual summary table ── */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Résumé annuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-4">Année</th>
                  <th className="text-right py-2 px-3">Valeur fin</th>
                  <th className="text-right py-2 px-3">Gains réalisés</th>
                  <th className="text-right py-2 px-3">Dividendes</th>
                  <th className="text-right py-2 px-3">Frais</th>
                  <th className="text-right py-2 pl-3">Perf. nette</th>
                </tr>
              </thead>
              <tbody>
                {ANNUAL.map((y) => (
                  <tr key={y.year} className="border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="py-2.5 pr-4 font-medium">{y.year}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-blue-400 font-medium">{fmt(y.portfolio)}</td>
                    <td className={cn("py-2.5 px-3 text-right tabular-nums", y.realise > 0 ? "text-primary" : y.realise < 0 ? "text-destructive" : "text-muted-foreground")}>
                      {y.realise > 0 ? "+" : ""}{fmt(y.realise)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-amber-400">+{fmt(y.dividendes)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                      {y.frais !== null ? `-${fmt(y.frais)}` : "—"}
                    </td>
                    <td className={cn("py-2.5 pl-3 text-right tabular-nums font-medium", y.perf !== null && y.perf > 0 ? "text-primary" : "text-muted-foreground")}>
                      {y.perf !== null ? `+${fmt(y.perf)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border text-xs text-muted-foreground">
                  <td className="pt-3 pr-4 font-medium">Total</td>
                  <td className="pt-3 px-3 text-right" />
                  <td className="pt-3 px-3 text-right tabular-nums text-primary font-medium">+{fmt(totalRealise)}</td>
                  <td className="pt-3 px-3 text-right tabular-nums text-amber-400 font-medium">+{fmt(totalDividendes)}</td>
                  <td className="pt-3 px-3 text-right tabular-nums">{fmt(ANNUAL.reduce((s,y)=> s+(y.frais||0),0))}</td>
                  <td className="pt-3 pl-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Cash balance + Flows ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Solde trésorerie (fin de trimestre)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Solde du compte courant DEGIRO — 0€ = tout est investi.
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={[
                  { period: "Sep 2020", balance: 11.59 },
                  { period: "Déc 2020", balance: 131.44 },
                  { period: "Mar 2021", balance: 567 },
                  { period: "Jun 2021", balance: 1790.90 },
                  { period: "Sep 2021", balance: 3.95 },
                  { period: "Déc 2021", balance: 0 },
                  { period: "Mar 2022", balance: 0 },
                  { period: "Jun 2022", balance: 73.37 },
                  { period: "Sep 2022", balance: 72.11 },
                  { period: "Déc 2022", balance: 610.13 },
                  { period: "Mar 2023", balance: 0 },
                  { period: "Jun 2023", balance: 222.45 },
                  { period: "Sep 2023", balance: 271.20 },
                  { period: "Déc 2023", balance: 0 },
                  { period: "Mar 2024", balance: 596.78 },
                  { period: "Jun 2024", balance: 0 },
                  { period: "Sep 2024", balance: 0 },
                  { period: "Déc 2024", balance: 96.82 },
                  { period: "Mar 2025", balance: 0 },
                  { period: "Jun 2025", balance: 0 },
                  { period: "Sep 2025", balance: 0 },
                  { period: "Déc 2025", balance: 245.79 },
                  { period: "Mar 2026", balance: 0 },
                  { period: "Jun 2026", balance: 1003.23 },
                ]}
                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="cashGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="oklch(0.65 0.18 255)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="oklch(0.65 0.18 255)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="period" tick={{ fontSize: 7, fill: "oklch(0.5 0 0)" }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }} tickFormatter={fmt} width={75} />
                <Tooltip {...TS} formatter={(v) => [fmt(Number(v)), "Solde cash"]} />
                <Area type="monotone" dataKey="balance" stroke="oklch(0.65 0.18 255)" strokeWidth={1.5} fill="url(#cashGrad2)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dépôts & retraits par année</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={YEARLY_FLOWS} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }} />
                <YAxis tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }} tickFormatter={v => fmt(Math.abs(v))} domain={["auto","auto"]} width={75} />
                <Tooltip {...TS} formatter={(v, name) => [fmt(Math.abs(Number(v))), name === "deposits" ? "Dépôts" : "Retraits"]} />
                <ReferenceLine y={0} stroke="oklch(0.45 0 0)" />
                <Bar dataKey="deposits" fill="oklch(0.72 0.17 145)" radius={[3,3,0,0]} name="deposits" />
                <Bar dataKey="withdrawals" fill="oklch(0.62 0.18 30)" radius={[3,3,0,0]} name="withdrawals" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary" /> Dépôts : {fmt(totalDeposits)}</div>
              <div className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{background:"oklch(0.62 0.18 30)"}} /> Retraits : -{fmt(totalWithdrawals)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Timeline ── */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-6">Chronologie des événements clés</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4 pl-12">
            {EVENTS.map((ev, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[2.25rem] top-3.5 w-2.5 h-2.5 rounded-full ring-2 ring-background ${EVENT_DOT[ev.type]}`} />
                <div className={`rounded-lg border p-4 ${EVENT_BORDER[ev.type]}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 leading-none mt-0.5">{ev.icon}</span>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{ev.date}</div>
                      <div className="font-semibold text-sm mb-1">{ev.title}</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">{ev.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Source ── */}
      <div className="p-4 rounded-lg border border-border/40 bg-muted/10 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground/70">Sources :</strong> Rapports annuels DEGIRO 2019–2025 · Relevés annuels des coûts et frais 2019–2024 · Relevés d&apos;instruments financiers trimestriels Q2 2023–Q2 2026 (flatexDEGIRO Bank AG, compte DE94 1013 0800 1016 6663 72).
        Les gains/pertes réalisés et dividendes sont issus des rapports officiels. Les valeurs de portefeuille trimestrielles proviennent des relevés d&apos;instruments au cours de clôture à la date de reporting.
      </div>
    </div>
  );
}
