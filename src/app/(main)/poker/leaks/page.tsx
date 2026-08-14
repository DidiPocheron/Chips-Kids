import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LeakStatus = "actif" | "en travail" | "corrigé";

interface Leak {
  title: string;
  summary: string;
  points: string[];
  status: LeakStatus;
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
