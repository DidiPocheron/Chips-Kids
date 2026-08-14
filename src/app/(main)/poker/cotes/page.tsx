import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DrawOdds {
  label: string;
  detail: string;
  outs: number;
  turn: number;
  river: number;
  total: number;
}

const DRAWS: DrawOdds[] = [
  { label: "Quinte ventrale", detail: "Gutshot — 4 outs", outs: 4, turn: 8.5, river: 8.7, total: 16.5 },
  { label: "Deux overcards", detail: "Ex : AK sur un flop 9-6-2 — 6 outs", outs: 6, turn: 12.8, river: 13.0, total: 24.1 },
  { label: "Quinte ouverte", detail: "Deux façons (OESD) — 8 outs", outs: 8, turn: 17.0, river: 17.4, total: 31.5 },
  { label: "Couleur", detail: "Tirage flush — 9 outs", outs: 9, turn: 19.1, river: 19.6, total: 35.0 },
  { label: "Brelan → carré ou full", detail: "Set qui s'améliore — 10 outs", outs: 10, turn: 21.3, river: 21.7, total: 38.4 },
  { label: "Couleur + quinte ventrale", detail: "Tirage combiné — 12 outs", outs: 12, turn: 25.5, river: 26.1, total: 45.0 },
  { label: "Couleur + quinte ouverte", detail: "Combo draw — 15 outs", outs: 15, turn: 31.9, river: 32.6, total: 54.1 },
];

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted/50 rounded-xl p-3 text-center">
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-bold text-primary tabular-nums">{value.toFixed(1)}%</div>
    </div>
  );
}

export default function PokerCotesPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Poker — Cotes &amp; probabilités</h1>
          <p className="text-muted-foreground text-sm">
            Mémo des tirages les plus courants, pour arrêter de deviner à la table.
          </p>
        </div>
        <Link
          href="/bankroll"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Poker
        </Link>
      </div>

      {/* Règle du 4 et du 2 */}
      <Card className="mb-8 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">La règle du 4 et du 2</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>
            Pas besoin de calculette à la table. Compte tes outs (les cartes qui complètent ton tirage), puis :
          </p>
          <ul className="list-disc list-inside space-y-1 text-foreground">
            <li><strong>Au flop</strong> (2 cartes à venir) : outs × 4 ≈ % de toucher d&apos;ici la river.</li>
            <li><strong>Au turn</strong> (1 carte à venir) : outs × 2 ≈ % de toucher à la river.</li>
          </ul>
          <p>
            Au-delà de 8 outs, retire 1 au résultat obtenu — la règle surestime légèrement à partir de ce seuil.
            Exemple : 9 outs (couleur) × 4 = 36, moins 1 = 35%, ce qui colle exactement au chiffre réel ci-dessous.
          </p>
        </CardContent>
      </Card>

      {/* Tableau des tirages */}
      <div className="space-y-4 mb-8">
        {DRAWS.map((d) => (
          <Card key={d.label} className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-semibold text-foreground">{d.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.detail}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-bold text-primary tabular-nums">{d.outs}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wide">outs</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatBlock label="Au turn" value={d.turn} />
                <StatBlock label="À la river" value={d.river} />
                <StatBlock label="Flop → river" value={d.total} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comment compter ses outs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compter ses outs sur un tirage combiné</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>
            Sur un tirage combiné (couleur + quinte par exemple), additionne les outs de chaque tirage — mais
            attention à ne pas compter deux fois une carte qui compléterait les deux à la fois.
          </p>
          <p className={cn("text-foreground")}>
            Exemple : 9 outs couleur + 8 outs quinte ouverte = 17 en théorie, mais si une des cartes de quinte
            fait aussi partie de la couleur, elle ne compte qu&apos;une fois → 15 outs réels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
