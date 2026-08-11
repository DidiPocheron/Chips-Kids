"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Landmark, ShieldCheck, Clock, Euro, Info } from "lucide-react";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

// ── Data ──────────────────────────────────────────────────────────────────────

const OUVERTURE = "04/05/2017";
const VERSEMENTS = 14697;
const VALEUR_ACTUELLE = 17436;
const DATE_VALEUR = "08/07/2026";
const PNL = VALEUR_ACTUELLE - VERSEMENTS; // +2 739 €
const PNL_PCT = (PNL / VERSEMENTS) * 100; // +18.64 %

// Versements cumulés estimés : faible ouverture 2017, progressif 2021-2023, accélération 2024-2026
const VERSEMENTS_ESTIMES = [
  { period: "Mai 2017", cumul: 500 },
  { period: "Déc 2018", cumul: 700 },
  { period: "Déc 2020", cumul: 900 },
  { period: "Déc 2021", cumul: 3200 },
  { period: "Déc 2022", cumul: 5400 },
  { period: "Déc 2023", cumul: 7600 },
  { period: "Déc 2024", cumul: 10500 },
  { period: "Déc 2025", cumul: 13500 },
  { period: "Juil 2026", cumul: 14697 },
];

const FISCALITE = [
  {
    annees: "0 à 5 ans",
    prelevement: "12,8 %",
    csg: "17,2 %",
    total: "30 %",
    note: "Flat tax complète",
    bad: true,
  },
  {
    annees: "5 ans et +",
    prelevement: "0 %",
    csg: "17,2 %",
    total: "17,2 %",
    note: "Exonération IR",
    bad: false,
  },
];

function PerfAnnualiseeCard() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  function updatePos() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 8, left: Math.max(8, r.right - 288) });
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        popRef.current && !popRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    function onScroll() {
      if (open) updatePos();
    }
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  function handleOpen() {
    updatePos();
    setOpen(o => !o);
  }

  return (
    <>
      <Card className="border-dashed">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Perf. annualisée</span>
            <button
              ref={btnRef}
              onClick={handleOpen}
              className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-bold tabular-nums text-muted-foreground">—</div>
          <div className="text-xs text-muted-foreground mt-0.5">historique insuffisant</div>
        </CardContent>
      </Card>

      {open && (
        <div
          ref={popRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: 288, zIndex: 999 }}
          className="bg-card border border-border rounded-xl shadow-xl p-4"
        >
          <div className="font-semibold text-sm mb-2">Pourquoi ce calcul est impossible ?</div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            La performance annualisée (TCAM) mesure le taux de croissance annuel moyen d'un capital fixe.
            Elle n'est pertinente que si le montant investi est <strong className="text-foreground">stable dans le temps</strong>.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            Ici, les versements ont été très progressifs : une infime somme en 2017, presque rien jusqu'en 2021,
            puis une montée régulière, puis une accélération. Chaque nouveau versement <strong className="text-foreground">modifie la base de calcul</strong>,
            rendant le TCAM trompeur.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Exemple : si 13 000 € sur 14 697 € ont été versés après 2022, calculer une perf sur 9 ans
            sous-estime massivement le rendement réel de ces sommes.
            Sans l'historique précis de chaque versement et de la valeur du portefeuille à chaque date,
            tout chiffre annualisé serait <strong className="text-foreground">artificiellement biaisé</strong>.
          </p>
        </div>
      )}
    </>
  );
}

function fmtEur(v: number, sign = false) {
  return (sign && v > 0 ? "+" : "") + v.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
}

export default function HistoriquePEAPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Back */}
        <Link href="/bourse" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour Bourse
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Historique PEA</h1>
              <p className="text-sm text-muted-foreground">Boursorama → Fortuneo · 2017 – 2026</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Plan d'Épargne en Actions ouvert le <strong>{OUVERTURE}</strong> chez Boursorama, puis transféré chez{" "}
            <strong>Fortuneo</strong>. Peu de documents disponibles sur la période Boursorama, mais les versements et la
            valorisation actuelle permettent de dresser un bilan global.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Versements</span>
              </div>
              <div className="text-2xl font-bold tabular-nums">{fmtEur(VERSEMENTS)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">depuis ouverture</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Valeur actuelle</span>
              </div>
              <div className="text-2xl font-bold tabular-nums">{fmtEur(VALEUR_ACTUELLE)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">au {DATE_VALEUR}</div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Plus-value</span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-green-500">{fmtEur(PNL, true)}</div>
              <div className="text-xs text-green-500 font-medium mt-0.5">+{PNL_PCT.toFixed(1)} % brut</div>
            </CardContent>
          </Card>

          <PerfAnnualiseeCard />
        </div>

        {/* Évolution estimée */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Versements cumulés estimés</CardTitle>
            <p className="text-xs text-muted-foreground">
              Courbe indicative des versements — faible ouverture en 2017 pour faire courir le délai fiscal, montée progressive à partir de 2021, puis accélération jusqu'en 2026.
              L'historique des valeurs de portefeuille n'est pas disponible sur toute la période.
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={VERSEMENTS_ESTIMES} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="peaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={45} />
                <Tooltip
                  formatter={(v: number) => [fmtEur(v), "Versements cumulés"]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="cumul" stroke="#3b82f6" strokeWidth={2} fill="url(#peaGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pourquoi un PEA */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Pourquoi ouvrir un PEA ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le Plan d'Épargne en Actions est une <strong>enveloppe fiscale française</strong> qui permet d'investir en
              actions européennes tout en bénéficiant d'une fiscalité allégée après <strong>5 ans de détention</strong>.
              C'est la raison principale de son ouverture en 2017 : construire une épargne long terme avec un avantage
              fiscal croissant.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-4">
                <div className="font-semibold text-sm mb-2">✅ Avantages</div>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>• Exonération d'impôt sur le revenu après 5 ans</li>
                  <li>• Plafond de versements élevé : <strong>150 000 €</strong></li>
                  <li>• Dividendes et plus-values capitalisent sans frottement fiscal</li>
                  <li>• Accès aux ETF et actions européennes</li>
                  <li>• Clôture possible à tout moment (mais fiscalité pénalisante avant 5 ans)</li>
                </ul>
              </div>
              <div className="bg-muted/40 border border-border rounded-xl p-4">
                <div className="font-semibold text-sm mb-2">⚠️ Contraintes</div>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>• Réservé aux actions / ETF de l'UE/EEE</li>
                  <li>• Tout retrait avant 5 ans entraîne la <strong>clôture du plan</strong></li>
                  <li>• Pas d'accès aux actions US en direct (sauf via ETF)</li>
                  <li>• Les versements sont définitivement consommés après retrait</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fiscalité */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Fiscalité selon la durée de détention</CardTitle>
            <p className="text-xs text-muted-foreground">Taux applicables sur les plus-values et dividendes au moment d'un retrait</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 pr-4 text-muted-foreground font-medium">Durée</th>
                    <th className="text-right py-2.5 px-4 text-muted-foreground font-medium">Impôt (IR)</th>
                    <th className="text-right py-2.5 px-4 text-muted-foreground font-medium">Prél. sociaux</th>
                    <th className="text-right py-2.5 px-4 text-muted-foreground font-medium">Total</th>
                    <th className="text-right py-2.5 pl-4 text-muted-foreground font-medium">Régime</th>
                  </tr>
                </thead>
                <tbody>
                  {FISCALITE.map(row => (
                    <tr key={row.annees} className={cn("border-b border-border/50", !row.bad && "bg-green-500/5")}>
                      <td className="py-3 pr-4 font-medium">{row.annees}</td>
                      <td className={cn("text-right py-3 px-4 tabular-nums", row.bad ? "text-red-500" : "text-green-500")}>{row.prelevement}</td>
                      <td className="text-right py-3 px-4 tabular-nums text-muted-foreground">{row.csg}</td>
                      <td className={cn("text-right py-3 px-4 tabular-nums font-bold", row.bad ? "text-red-500" : "text-green-500")}>{row.total}</td>
                      <td className="text-right py-3 pl-4 text-xs text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-green-500/8 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400">
                <strong>Mon PEA a été ouvert en mai 2017</strong> — il a donc largement dépassé les 5 ans.
                En cas de retrait aujourd'hui, seuls les prélèvements sociaux de <strong>17,2 %</strong> s'appliquent,
                soit une économie de 12,8 % par rapport à la flat tax standard. Sur{" "}
                {fmtEur(PNL)} de plus-value, cela représente une économie d'environ{" "}
                <strong>{fmtEur(Math.round(PNL * 0.128))}</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stratégie actuelle */}
        <Card className="mb-8 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              🎯 Stratégie actuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Après réflexion, <strong>je ne souhaite plus alimenter ce PEA</strong> ni en retirer de l'argent dans l'immédiat.
              Les nouveaux investissements sont désormais orientés vers la <strong>crypto</strong>, le{" "}
              <strong>compte-titres ordinaire</strong> et le <strong>trading</strong>, qui offrent plus de flexibilité
              et d'exposition à des actifs hors zone européenne.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-muted/40 rounded-lg p-3">
                <div className="font-semibold text-foreground mb-1">Pourquoi ne plus déposer ?</div>
                <ul className="space-y-1">
                  <li>• Préférence pour des actifs plus dynamiques (crypto, trading)</li>
                  <li>• Diversification hors zone euro souhaitée</li>
                  <li>• Flexibilité de retrait immédiate sur les autres enveloppes</li>
                </ul>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                <div className="font-semibold text-foreground mb-1">Pourquoi ne pas retirer ?</div>
                <ul className="space-y-1">
                  <li>• Fiscalité favorable acquise (uniquement 17,2 %)</li>
                  <li>• Capitalisation libre à l'intérieur du plan</li>
                  <li>• Option de retrait partiel disponible sans clôture après 5 ans</li>
                  <li>• Filet de sécurité long terme</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bilan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bilan global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Date d'ouverture</div>
                <div className="font-semibold">{OUVERTURE}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Total versé</div>
                <div className="font-semibold">{fmtEur(VERSEMENTS)}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Valeur au {DATE_VALEUR}</div>
                <div className="font-semibold">{fmtEur(VALEUR_ACTUELLE)}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Plus-value brute</div>
                <div className="font-semibold text-green-500">{fmtEur(PNL, true)} ({PNL_PCT.toFixed(1)} %)</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Durée de détention</div>
                <div className="font-semibold">~9 ans 2 mois</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Perf. annualisée</div>
                <div className="font-semibold text-muted-foreground">— (historique insuffisant)</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Fiscalité retrait</div>
                <div className="font-semibold text-green-500">17,2 % (PS seuls)</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Économie vs flat tax</div>
                <div className="font-semibold text-green-500">~{fmtEur(Math.round(PNL * 0.128))}</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
