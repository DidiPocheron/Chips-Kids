import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

export default function PokerBountyPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Poker — Bounty &amp; KO</h1>
          <p className="text-muted-foreground text-sm">
            Convertir une prime d&apos;élimination en bb, et les règles spécifiques du Space KO Winamax.
          </p>
        </div>
        <Link
          href="/poker/cotes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Cotes
        </Link>
      </div>

      {/* Conversion bounty -> bb */}
      <Card className="mb-8 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Convertir un bounty en bb quand tu couvres l&apos;adversaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Step n={1}>
              <strong className="text-foreground">Valeur d&apos;un jeton en €</strong> = buy-in ÷ tapis de départ (en jetons).
            </Step>
            <Step n={2}>
              <strong className="text-foreground">Valeur de la bb actuelle en €</strong> = jetons de la bb × valeur d&apos;un jeton.
            </Step>
            <Step n={3}>
              <strong className="text-foreground">Bounty en bb</strong> = montant du bounty (€) ÷ valeur de la bb en €.
            </Step>
            <Step n={4}>
              En KO progressif (et sur Space KO), tu ne touches que <strong className="text-foreground">la moitié</strong> du
              bounty affiché immédiatement en cash — l&apos;autre moitié grossit ton propre bounty. Pour juger un
              call ou un shove, ajoute donc seulement <strong className="text-foreground">la moitié du bounty-en-bb</strong> à
              ton équité, pas la totalité.
            </Step>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border/60 text-sm">
            <div className="font-semibold text-foreground mb-2">Exemple</div>
            <p className="text-muted-foreground leading-relaxed">
              Buy-in 20€, tapis de départ 20 000 jetons → 1 jeton = 0,001€.<br />
              BB actuelle : 400 jetons → valeur bb = 0,40€.<br />
              Ton adversaire a 8€ de bounty sur la tête → 8 ÷ 0,40 = <strong className="text-foreground">20 bb</strong>.<br />
              Règle : ajoute <strong className="text-primary">10 bb</strong> (la moitié) à ton équité pour la décision — pas 20.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Space KO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Le cas particulier du Space KO (Winamax)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            Le Space KO mélange KO progressif, Mystery et Expresso. Les règles du poker ne changent pas — seule
            l&apos;attribution des primes est revue :
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-foreground">
            <li>Le buy-in est réparti en <strong>40% prizepool classique</strong>, <strong>50% primes aléatoires</strong> et <strong>10% rake</strong>.</li>
            <li>Chaque joueur démarre avec un <strong>Token de niveau 1</strong>. Il existe 14 niveaux (Argent, Or, Légendaire).</li>
            <li>Éliminer un adversaire déclenche un tirage au sort dont le montant dépend du <strong>niveau du Token du joueur éliminé</strong> — pas du tien.</li>
            <li>Comme en KO progressif classique : <strong>la moitié de la prime</strong> tirée au sort est créditée immédiatement en cash, l&apos;autre moitié <strong>grossit ton propre Token</strong> (donc ta valeur en tant que cible).</li>
            <li>Aucune limite au nombre de primes que tu peux gagner sur un tournoi.</li>
            <li>Si tu élimines plusieurs joueurs sur une même main, tu obtiens un tirage par joueur éliminé.</li>
            <li>Si un joueur est éliminé à égalité par plusieurs adversaires, une seule prime est tirée puis partagée équitablement entre eux.</li>
          </ul>
          <p>
            Conséquence pratique : la règle de conversion ci-dessus s&apos;applique telle quelle sur Space KO, avec une
            incertitude en plus — le montant exact du bounty n&apos;est connu qu&apos;après élimination, seul l&apos;intervalle du
            Token (affiché à table) donne une fourchette avant de t&apos;engager.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
