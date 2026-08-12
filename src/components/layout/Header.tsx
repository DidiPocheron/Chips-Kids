"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS_POKER = [
  { href: "/bankroll", label: "Résultats" },
  { href: "/logbook", label: "Carnet de bord" },
  { href: "/bankroll-management", label: "BRM" },
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

const POKER_PATHS = NAV_LINKS_POKER.map(l => l.href);
const CRYPTO_PATHS = NAV_LINKS_CRYPTO.map(l => l.href);
const BOURSE_PATHS = NAV_LINKS_BOURSE.map(l => l.href);
const TRADING_PATHS = NAV_LINKS_TRADING.map(l => l.href);

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

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo-requin.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-heading font-bold text-xl text-foreground tracking-tight">
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
        </nav>

        {/* Mobile */}
        <nav className="flex md:hidden items-center gap-1">
          {[...NAV_LINKS_POKER, ...NAV_LINKS_CRYPTO, ...NAV_LINKS_BOURSE, ...NAV_LINKS_TRADING].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-2 py-1.5 rounded text-xs font-medium transition-colors",
                pathname === href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label.split(" ")[0]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
