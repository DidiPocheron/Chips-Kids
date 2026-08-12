"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useBourseTicketStore } from "@/hooks/useBourseTicketStore";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { BourseTicket } from "@/types";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatEur(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ImageCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  if (images.length === 0) return null;
  return (
    <>
      <div className="relative bg-muted rounded-lg overflow-hidden h-56 mb-4">
        <img src={images[idx]} alt="" className="w-full h-full object-contain cursor-zoom-in" onClick={() => setLightbox(true)} />
        {images.length > 1 && (
          <>
            <button onClick={() => setIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setIdx(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full"><ChevronRight className="w-4 h-4" /></button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/40"}`} />)}
            </div>
          </>
        )}
      </div>
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full"><X className="w-5 h-5" /></button>
          <img src={images[idx]} alt="" className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

function AccountBlock({ label, portfolioValue, investedValue, pnl }: {
  label: string;
  portfolioValue: number;
  investedValue: number;
  pnl: number;
}) {
  const pct = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
  return (
    <div className="bg-muted/50 rounded-xl p-3 space-y-1">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-base font-semibold tabular-nums">{formatEur(portfolioValue)} €</div>
      <div className="text-xs text-muted-foreground">Investi {formatEur(investedValue)} €</div>
      {investedValue > 0 && (
        <div className={cn("text-xs font-semibold tabular-nums", pnl >= 0 ? "text-green-600" : "text-destructive")}>
          {pnl >= 0 ? "+" : ""}{formatEur(pnl)} € ({pct >= 0 ? "+" : ""}{pct.toFixed(1)}%)
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket }: { ticket: BourseTicket }) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [ticket.description]);

  const totalValue = ticket.ctPortfolioValue + ticket.peaPortfolioValue;
  const totalInvested = ticket.ctInvestedValue + ticket.peaInvestedValue;
  const totalPnl = ticket.ctPnl + ticket.peaPnl;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <Card className="border-l-4 border-l-blue-400 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="font-semibold text-sm text-blue-500">Bourse</div>
            <div className="text-xs text-muted-foreground mt-0.5">{formatDate(ticket.date)}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold tabular-nums">{formatEur(totalValue)} €</div>
            {totalInvested > 0 && (
              <div className={cn("text-sm font-semibold tabular-nums mt-0.5", totalPnl >= 0 ? "text-green-600" : "text-destructive")}>
                {totalPnl >= 0 ? "+" : ""}{formatEur(totalPnl)} €
                <span className="text-xs ml-1 opacity-80">({totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(1)}%)</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <AccountBlock label="Compte titre" portfolioValue={ticket.ctPortfolioValue} investedValue={ticket.ctInvestedValue} pnl={ticket.ctPnl} />
          <AccountBlock label="PEA" portfolioValue={ticket.peaPortfolioValue} investedValue={ticket.peaInvestedValue} pnl={ticket.peaPnl} />
        </div>

        <ImageCarousel images={ticket.photos} />

        {ticket.description && (
          <>
            <p ref={descRef} className={cn("text-sm text-muted-foreground leading-relaxed whitespace-pre-line", !expanded && "line-clamp-4")}>
              {ticket.description}
            </p>
            {isTruncated && (
              <button onClick={() => setExpanded(!expanded)} className="mt-2 text-sm text-primary hover:text-primary/80 font-medium">
                {expanded ? "Voir moins" : "Lire la suite"}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function BourseLogbookPage() {
  const { tickets, loaded } = useBourseTicketStore();

  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => b.date.localeCompare(a.date)),
    [tickets]
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Bourse — Carnet de bord</h1>
          <p className="text-muted-foreground">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/bourse"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          <ArrowLeft className="w-4 h-4" /> Chiffres
        </Link>
      </div>

      {loaded && tickets.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-muted-foreground">Aucun ticket bourse pour l&apos;instant.</p>
        </div>
      )}

      <div className="space-y-4">
        {sortedTickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
