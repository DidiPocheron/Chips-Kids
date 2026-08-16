"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Toggle pour afficher/masquer la section Immobilier sur le site.
const SHOW_IMMOBILIER = true;

const NAV_LINKS_POKER = [
  { href: "/bankroll", label: "Résultats" },
  { href: "/logbook", label: "Carnet de bord" },
  { href: "/bankroll-management", label: "BRM" },
  { href: "/poker/cotes", label: "Cotes" },
  { href: "/poker/leaks", label: "Leaks" },
];

const NAV_LINKS_CRYPTO = [
  { href: "/crypto", label: "Chiffres" },
  { href: "/crypto/logbook", label: "Carnet de bord" },
];

const NAV_LINKS_BOURSE = [
  { href: "/bourse", label: "Chiffres" },
  { href: "/bourse/logbook", label: "Carnet de bord" },
  { href: "/bourse/historique", label: "Historique compte titre 2019–2026" },
  { href: "/bourse/historique-pea", label: "Historique PEA 2017–2026" },
];

const NAV_LINKS_TRADING = [
  { href: "/trading", label: "Chiffres" },
  { href: "/trading/strategie", label: "Stratégie" },
];

const NAV_LINKS_IMMOBILIER = [
  { href: "/immobilier", label: "Vente & emprunt" },
];

const POKER_PATHS = NAV_LINKS_POKER.map(l => l.href);
const CRYPTO_PATHS = NAV_LINKS_CRYPTO.map(l => l.href);
const BOURSE_PATHS = NAV_LINKS_BOURSE.map(l => l.href);
const TRADING_PATHS = NAV_LINKS_TRADING.map(l => l.href);
const IMMOBILIER_PATHS = NAV_LINKS_IMMOBILIER.map(l => l.href);

const NAV_GROUPS = [
  { label: "Poker", links: NAV_LINKS_POKER, color: "text-primary", border: "border-primary/20", bg: "bg-primary/5" },
  { label: "Crypto", links: NAV_LINKS_CRYPTO, color: "text-orange-400", border: "border-orange-400/20", bg: "bg-orange-400/5" },
  { label: "Bourse", links: NAV_LINKS_BOURSE, color: "text-blue-400", border: "border-blue-400/20", bg: "bg-blue-400/5" },
  { label: "Trading", links: NAV_LINKS_TRADING, color: "text-purple-400", border: "border-purple-400/20", bg: "bg-purple-400/5" },
  ...(SHOW_IMMOBILIER
    ? [{ label: "Immobilier", links: NAV_LINKS_IMMOBILIER, color: "text-rose-400", border: "border-rose-400/20", bg: "bg-rose-400/5" }]
    : []),
];

function NavDropdown({
  label,
  links,
  activePaths,
  pathname,
}: {
  label: string;
  links: { href: string; label: string }[];
  activePaths: string[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = activePaths.some(p => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {label}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-border bg-card shadow-lg py-1 z-50">
          {links.map(({ href, label: lbl }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-4 py-2 text-sm transition-colors",
                pathname === href
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {lbl}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0">
          <img src="/logo-requin.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
          <span className="font-heading font-bold text-base sm:text-xl text-foreground tracking-tight truncate">
            Chips <span className="text-[#5B9FD4]">&</span> Trade
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <NavDropdown label="Poker" links={NAV_LINKS_POKER} activePaths={POKER_PATHS} pathname={pathname} />
          <div className="w-px h-4 bg-border mx-1" />
          <NavDropdown label="Crypto" links={NAV_LINKS_CRYPTO} activePaths={CRYPTO_PATHS} pathname={pathname} />
          <div className="w-px h-4 bg-border mx-1" />
          <NavDropdown label="Bourse" links={NAV_LINKS_BOURSE} activePaths={BOURSE_PATHS} pathname={pathname} />
          <div className="w-px h-4 bg-border mx-1" />
          <NavDropdown label="Trading" links={NAV_LINKS_TRADING} activePaths={TRADING_PATHS} pathname={pathname} />
          {SHOW_IMMOBILIER && (
            <>
              <div className="w-px h-4 bg-border mx-1" />
              <NavDropdown label="Immobilier" links={NAV_LINKS_IMMOBILIER} activePaths={IMMOBILIER_PATHS} pathname={pathname} />
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden shrink-0 p-2 -mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-card px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className={cn("rounded-xl border p-3", group.border, group.bg)}>
                <p className={cn("text-xs font-semibold uppercase tracking-wide mb-2", group.color)}>
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.links.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "px-2 py-1.5 -mx-2 rounded-lg text-sm font-medium transition-colors",
                        pathname === href
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
