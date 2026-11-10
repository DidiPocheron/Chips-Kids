import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

// Bloc de chargement en pleine largeur, à afficher pendant l'attente d'une
// réponse (Firestore, API...) avant que le contenu réel ne soit disponible --
// remplace l'ancien comportement où la page restait vide ou affichait des
// valeurs par défaut (0€, etc.) le temps du chargement.
export function PageLoader({ label = "Chargement…" }: { label?: string }) {
  return (
    <Card>
      <CardContent className="py-16 flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <Spinner className="w-5 h-5" />
        {label}
      </CardContent>
    </Card>
  );
}
