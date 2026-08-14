import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LeakStatus = "actif" | "en travail" | "corrigé";

interface LeakExample {
  src: string;
  caption: string;
}

interface Leak {
  title: string;
  summary: string;
  points: string[];
  status: LeakStatus;
  examples?: LeakExample[];
}

const STATUS_STYLE: Record<LeakStatus, { label: string; className: string }> = {
  actif: { label: "Actif", className: "bg-destructive/10 text-destructive" },
  "en travail": { label: "En travail", className: "bg-orange-400/10 text-orange-500" },
  "corrigé": { label: "Corrigé", className: "bg-primary/10 text-primary" },
};

const LEAKS: Leak[] = [
  {
    title: "Trop tight",
    summary:
      "Je perçois systématiquement les ranges adverses comme plus fortes qu'elles ne le sont réellement — et ça me coûte de l'EV sur plusieurs types de spots.",
    points: [
      "Opens preflop trop resserrés, en particulier en position tardive où la range devrait s'élargir.",
      "Défense face aux 3-bet trop passive — je fold trop souvent au lieu de defendre ou de 4-bet.",
      "Call des tapis (all-in) trop craintif — je surestime la force de la range adverse et je fold des mains qui ont pourtant assez d'équité pour call.",
    ],
    status: "actif",
    examples: [
      {
        src: "/leaks/leak-tight-example-1.jpg",
        caption:
          "Winamax Series — Q♠10♣, all-in preflop face à un pot de 42.9 BB. C'est un spot de raise/call ou shove direct que je ne prends pas encore.",
      },
    ],
  },
  {
    title: "Trop de tables ouvertes",
    summary:
      "J'ouvre trop de tables en même temps pour maximiser mon profit sur une soirée — une double erreur : je joue moins bien sur chaque table, et je n'ai plus le temps d'analyser mon jeu pendant la session.",
    points: [
      "Le multi-tabling excessif dégrade la qualité de chaque décision individuelle.",
      "Moins de temps pour lire les adversaires et analyser les spots en profondeur pendant que je joue.",
      "Ça renforce les automatismes au détriment de la réflexion — donc ça freine ma progression plutôt que de l'accélérer.",
      "Règle actuelle : rester à 4 tables maximum, le temps de solidifier les bases.",
    ],
    status: "en travail",
  },
  {
    title: "Je crédite trop les adversaires",
    summary:
      "Je pars du principe que l'adversaire a touché la plus grosse combinaison possible sur le board, et je sur-protège mes tirages au lieu de les jouer normalement.",
    points: [
      "Je lis le board avant de lire l'adversaire — je vois le pire scénario possible plutôt que sa range réelle.",
      "Sur-protection des tirages : je check ou je call petit par peur, au lieu de bet/raise pour faire payer les mains faites ou faire fold l'équité adverse.",
      "Cette peur du 'nut' adverse me fait perdre en value et en fold equity sur des spots où je suis souvent favori ou proche de 50/50.",
    ],
    status: "actif",
  },
  {
    title: "Sur-bet pour chasser le KO",
    summary:
      "Comme je joue uniquement des KO, j'ai le réflexe de bet trop gros pour maximiser mes chances d'élimination — et ça me coûte de la value sur les spots où un adversaire aurait payé un sizing plus petit.",
    points: [
      "Je pense 'bounty' avant de penser 'value' : le sizing est choisi pour isoler/éliminer, pas pour maximiser le gain sur la main.",
      "Contre des mains plus faibles qui auraient callé un bet raisonnable, je les fais fold avec un bet surdimensionné — value perdue.",
      "Le KO est un bonus, pas l'objectif principal de chaque main : il faut d'abord sizer pour la value, le bounty vient en plus si l'adversaire est éliminé.",
    ],
    status: "actif",
  },
];

export default function PokerLeaksPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Poker — Mes leaks</h1>
          <p className="text-muted-foreground text-sm">
            Un recensement honnête de mes fuites actuelles, pour les travailler une par une.
          </p>
        </div>
        <Link
          href="/poker/cotes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Cotes
        </Link>
      </div>

      <div className="space-y-4">
        {LEAKS.map((leak) => {
          const status = STATUS_STYLE[leak.status];
          return (
            <Card key={leak.title} className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="font-semibold text-lg text-foreground">{leak.title}</h2>
                  <span className={cn("shrink-0 text-xs font-medium px-2.5 py-1 rounded-full", status.className)}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{leak.summary}</p>
                <ul className="space-y-2">
                  {leak.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-sm text-foreground">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>

                {leak.examples && leak.examples.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-border/50 space-y-4">
                    {leak.examples.map((ex) => (
                      <figure key={ex.src}>
                        <img
                          src={ex.src}
                          alt={ex.caption}
                          className="w-full rounded-xl border border-border/60"
                        />
                        <figcaption className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          {ex.caption}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
