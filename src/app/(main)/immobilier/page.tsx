import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SaleScenario {
  label: string;
  salePrice: number;
}

const MAISON_REMAINING_LOAN = 187000;
const MAISON_SCENARIOS: SaleScenario[] = [
  { label: "Estimation basse", salePrice: 250000 },
  { label: "Objectif", salePrice: 280000 },
];

const APPART_REMAINING_LOAN = 44000;
const APPART_SCENARIOS: SaleScenario[] = [
  { label: "Estimation basse", salePrice: 85000 },
  { label: "Objectif", salePrice: 95000 },
];

function formatEUR(n: number) {
  return `${n.toLocaleString("fr-FR")} €`;
}

function ScenarioBlock({
  label,
  salePrice,
  remainingLoan,
}: {
  label: string;
  salePrice: number;
  remainingLoan: number;
}) {
  const net = salePrice - remainingLoan;
  return (
    <div className="bg-muted/50 rounded-xl p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{label}</div>
      <div className="flex items-baseline justify-between text-sm mb-1">
        <span className="text-muted-foreground">Prix de vente</span>
        <span className="font-medium text-foreground tabular-nums">{formatEUR(salePrice)}</span>
      </div>
      <div className="flex items-baseline justify-between text-sm mb-3">
        <span className="text-muted-foreground">Crédit restant dû</span>
        <span className="font-medium text-foreground tabular-nums">- {formatEUR(remainingLoan)}</span>
      </div>
      <div className="flex items-baseline justify-between pt-3 border-t border-border/50">
        <span className="text-sm font-semibold text-foreground">Net après vente</span>
        <span className="text-lg font-bold text-primary tabular-nums">{formatEUR(net)}</span>
      </div>
    </div>
  );
}

export default function ImmobilierPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Immobilier — Vente &amp; emprunt</h1>
          <p className="text-muted-foreground text-sm">
            Simulation de la vente de la maison et de l&apos;appartement en location, puis de la capacité
            d&apos;emprunt avec ma compagne.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
      </div>

      <div className="space-y-4">
        {/* Maison actuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maison actuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MAISON_SCENARIOS.map((s) => (
                <ScenarioBlock
                  key={s.label}
                  label={s.label}
                  salePrice={s.salePrice}
                  remainingLoan={MAISON_REMAINING_LOAN}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appartement en location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appartement en location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {APPART_SCENARIOS.map((s) => (
                <ScenarioBlock
                  key={s.label}
                  label={s.label}
                  salePrice={s.salePrice}
                  remainingLoan={APPART_REMAINING_LOAN}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Total combiné */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Total combiné (maison + appartement)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MAISON_SCENARIOS.map((s, i) => {
                const total =
                  s.salePrice -
                  MAISON_REMAINING_LOAN +
                  (APPART_SCENARIOS[i].salePrice - APPART_REMAINING_LOAN);
                return (
                  <div key={s.label} className="bg-card rounded-xl p-4 ring-1 ring-border/50">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{s.label}</div>
                    <div className="text-2xl font-bold text-primary tabular-nums">{formatEUR(total)}</div>
                    <div className="text-xs text-muted-foreground mt-1">net disponible après remboursement des deux crédits</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Capacité d'emprunt */}
        <Card className="border-dashed border-2 border-border/60 bg-transparent">
          <CardHeader>
            <CardTitle className="text-base">Capacité d&apos;emprunt</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Estimation basée sur mes revenus et ceux de ma compagne.
            <br />
            <br />
            En attente des chiffres.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
