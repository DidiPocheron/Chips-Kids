"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppAuth } from "@/hooks/useAppAuth";

interface Props {
  children: React.ReactNode;
  className?: string;
}

// Recouvre `children` d'un flou + cadenas tant que le site n'est pas
// déverrouillé (voir useAppAuth). Un clic n'importe où dans la zone envoie
// vers /login, avec l'URL courante en `redirect` pour revenir ici une fois
// connecté. Utilisé pour la section Bourse.
export function AuthLock({ children, className }: Props) {
  const { unlocked, ready } = useAppAuth();
  const pathname = usePathname();

  if (ready && unlocked) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="pointer-events-none select-none blur-md opacity-60">
        {children}
      </div>
      <Link
        href={`/login?redirect=${encodeURIComponent(pathname)}`}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/50 hover:bg-background/65 transition-colors"
      >
        <div className="w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-xs font-medium text-muted-foreground px-4 text-center">
          Section protégée — cliquer pour se connecter
        </span>
      </Link>
    </div>
  );
}
