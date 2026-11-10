import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Petit rond de chargement réutilisable partout où on attend une réponse
// d'un service (Firestore, API interne, cours en direct...).
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("w-4 h-4 animate-spin", className)} />;
}
