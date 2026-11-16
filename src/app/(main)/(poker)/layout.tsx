import { notFound } from "next/navigation";
import { HIDE_POKER } from "@/lib/config";

// Toutes les pages poker (Résultats, Carnet de bord, BRM, session tracker)
// passent par ce layout : quand HIDE_POKER vaut true, elles renvoient une 404.
// Le groupe "(poker)" ne change pas les URLs (/bankroll, /logbook...).
export default function PokerLayout({ children }: { children: React.ReactNode }) {
  if (HIDE_POKER) notFound();
  return <>{children}</>;
}
