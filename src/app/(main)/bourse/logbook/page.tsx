import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BourseLogbookPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8 select-none">
        <span className="text-8xl">📊</span>
        <span className="absolute -bottom-1 -right-3 text-4xl">🚧</span>
      </div>

      <h1 className="text-4xl font-bold mb-3 tracking-tight">Carnet de bord Bourse</h1>

      <p className="text-muted-foreground text-lg mb-2">
        Cette section est en cours de construction.
      </p>
      <p className="text-muted-foreground/60 text-sm mb-10">
        Suivi des décisions, analyses et notes d&apos;investissement — bientôt disponible.
      </p>

      <Link
        href="/bourse"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux chiffres
      </Link>

      <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground/40 font-mono tracking-widest uppercase">
        <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        Work in progress
      </div>
    </div>
  );
}
