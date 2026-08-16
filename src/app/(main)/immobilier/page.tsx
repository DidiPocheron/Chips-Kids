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

const REVENU_MOI = 3050;
const REVENU_COMPAGNE_MIN = 1500;
const REVENU_COMPAGNE_MAX = 1750;
const TAUX_ENDETTEMENT_MAX = 0.35; // norme HCSF standard, hors assurance

interface IncomeScenario {
  label: string;
  combinedIncome: number;
}

const INCOME_SCENARIOS: IncomeScenario[] = [
  { label: "Salaire compagne bas (1 500 €)", combinedIncome: REVENU_MOI + REVENU_COMPAGNE_MIN },
  { label: "Salaire compagne haut (1 750 €)", combinedIncome: REVENU_MOI + REVENU_COMPAGNE_MAX },
];

// Taux indicatifs août 2026 (CAFPI / Meilleurtaux), hors assurance emprunteur.
const LOAN_DURATIONS = [
  { years: 20, rate: 0.033 },
  { years: 25, rate: 0.0345 },
];

function borrowingCapacity(monthlyPayment: number, annualRate: number, years: number) {
  const i = annualRate / 12;
  const n = years * 12;
  return monthlyPayment * ((1 - Math.pow(1 + i, -n)) / i);
}

function formatEUR(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Capacité d&apos;emprunt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Basé sur un taux d&apos;endettement max de {TAUX_ENDETTEMENT_MAX * 100}% (norme HCSF) et des taux
              indicatifs d&apos;août 2026, hors assurance emprunteur.
            </p>

            {INCOME_SCENARIOS.map((income) => {
              const maxMonthly = income.combinedIncome * TAUX_ENDETTEMENT_MAX;
              return (
                <div key={income.label} className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">{income.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Revenus combinés {formatEUR(income.combinedIncome)} / mois
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground tabular-nums">{formatEUR(maxMonthly)}</div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">mensualité max</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {LOAN_DURATIONS.map((d) => (
                      <div key={d.years} className="bg-card rounded-lg p-3 ring-1 ring-border/50">
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                          Sur {d.years} ans ({(d.rate * 100).toFixed(2)}%)
                        </div>
                        <div className="text-xl font-bold text-primary tabular-nums">
                          {formatEUR(borrowingCapacity(maxMonthly, d.rate, d.years))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <p className="text-xs text-muted-foreground leading-relaxed">
              Estimation indicative uniquement — ne tient pas compte de l&apos;assurance emprunteur, des frais de
              dossier/garantie, ni du fait que le nouveau poste de ma compagne devra probablement être confirmé
              (fin de période d&apos;essai / CDI) pour être pris en compte par une banque. À confirmer avec un
              courtier ou une banque pour un chiffre définitif.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
