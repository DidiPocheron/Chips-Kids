import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="border-dashed border-2 border-border/60 bg-transparent">
          <CardHeader>
            <CardTitle className="text-base">Produit net de la vente</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Prix de vente de la maison actuelle et de l&apos;appartement en location, moins le capital restant dû
            sur chaque crédit → montant net disponible après vente.
            <br />
            <br />
            En attente des chiffres.
          </CardContent>
        </Card>

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
