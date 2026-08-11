"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCryptoTicketStore } from "@/hooks/useCryptoTicketStore";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { cn } from "@/lib/utils";
import { RefreshCw, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CryptoTicket, CryptoPortfolio } from "@/types";

const RATINGS: Record<string, { src: string; label: string; accent: string; color: string }> = {
  excellent:      { src: "/ratings/excellent.png",      label: "Excellent",     accent: "border-l-green-400",  color: "text-green-600" },
  good:           { src: "/ratings/good.png",           label: "Bon",           accent: "border-l-blue-400",   color: "text-blue-600" },
  ras:            { src: "/ratings/RAS.png",            label: "RAS",           accent: "border-l-border",     color: "text-muted-foreground" },
  "not-good":     { src: "/ratings/not-good.png",       label: "Mauvais",       accent: "border-l-orange-400", color: "text-orange-600" },
  catastrophique: { src: "/ratings/catastrophique.png", label: "Catastrophique",accent: "border-l-destructive",color: "text-destructive" },
};

const PORTFOLIO_ROWS: {
  key: keyof CryptoPortfolio;
  avgKey: keyof CryptoPortfolio;
  label: string;
  symbol: string;
  coinId: string | null;
  color: string;
}[] = [
  { key: "bitcoin",  avgKey: "bitcoinAvg",  label: "Bitcoin",  symbol: "BTC", coinId: "bitcoin",  color: "text-orange-500" },
  { key: "ethereum", avgKey: "ethereumAvg", label: "Ethereum", symbol: "ETH", coinId: "ethereum", color: "text-purple-500" },
  { key: "solana",   avgKey: "solanaAvg",   label: "Solana",   symbol: "SOL", coinId: "solana",   color: "text-green-500" },
  { key: "ripple",   avgKey: "rippleAvg",   label: "XRP",      symbol: "XRP", coinId: "ripple",   color: "text-blue-500" },
];

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

function TicketCard({ ticket, prices, pricesLoading }: {
  ticket: CryptoTicket;
  prices: Record<string, number | null>;
  pricesLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RATINGS[ticket.rating] ?? RATINGS.ras;

  const activeRows = PORTFOLIO_ROWS.filter(r => (ticket.portfolio[r.key] as number) > 0);

  const totalEur = activeRows.reduce((sum, row) => {
    const price = row.coinId ? prices[row.coinId] : null;
    return price ? sum + (ticket.portfolio[row.key] as number) * price : sum;
  }, 0);

  const totalCostBasis = activeRows.reduce((sum, row) => {
    const qty = ticket.portfolio[row.key] as number;
    const avg = (ticket.portfolio[row.avgKey] as number | undefined) || 0;
    return avg > 0 ? sum + qty * avg : sum;
  }, 0);
  const hasPnl = totalCostBasis > 0 && totalEur > 0 && !pricesLoading;
  const totalPnl = hasPnl ? totalEur - totalCostBasis : null;
  const totalPnlPct = hasPnl && totalCostBasis > 0 ? ((totalEur - totalCostBasis) / totalCostBasis) * 100 : null;

  return (
    <Card className={cn("border-l-4 hover:shadow-md transition-shadow", cfg.accent)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <img src={cfg.src} alt={cfg.label} className="w-12 h-12 object-contain" />
            <div>
              <div className={cn("font-semibold text-sm", cfg.color)}>{cfg.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{formatDate(ticket.date)}</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            {!pricesLoading && totalEur > 0 ? (
              <>
                <div className="text-lg font-bold tabular-nums">{formatEur(totalEur)} €</div>
                {totalPnl !== null && totalPnlPct !== null && (
                  <div className={cn("text-sm font-semibold tabular-nums mt-0.5", totalPnl >= 0 ? "text-green-600" : "text-destructive")}>
                    {totalPnl >= 0 ? "+" : ""}{formatEur(totalPnl)} €
                    <span className="text-xs ml-1 opacity-80">({totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(1)}%)</span>
                  </div>
                )}
              </>
            ) : pricesLoading ? (
              <div className="text-xs text-muted-foreground">Chargement…</div>
            ) : null}
          </div>
        </div>

        {/* Détail par crypto */}
        <div className="bg-muted/50 rounded-xl p-3 mb-4 space-y-3">
          {activeRows.map(row => {
            const qty = ticket.portfolio[row.key] as number;
            const avgPrice = (ticket.portfolio[row.avgKey] as number | undefined) || 0;
            const livePrice = row.coinId ? prices[row.coinId] : null;
            const valueEur = livePrice ? qty * livePrice : null;
            const costBasis = avgPrice > 0 ? qty * avgPrice : null;
            const pnl = valueEur !== null && costBasis !== null ? valueEur - costBasis : null;
            const pnlPct = pnl !== null && costBasis !== null && costBasis > 0 ? (pnl / costBasis) * 100 : null;
            return (
              <div key={row.key} className="space-y-0.5">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn("font-medium", row.color)}>
                    {qty.toLocaleString("fr-FR", { maximumFractionDigits: 8 })} {row.symbol}
                  </span>
                  <div className="text-right">
                    {valueEur !== null && !pricesLoading ? (
                      <span className="font-semibold tabular-nums">{formatEur(valueEur)} €</span>
                    ) : livePrice === null && row.coinId ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : null}
                  </div>
                </div>
                {avgPrice > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Moy. {avgPrice.toLocaleString("fr-FR")} €/{row.symbol}</span>
                    {pnl !== null && pnlPct !== null && !pricesLoading && (
                      <span className={cn("font-medium tabular-nums", pnl >= 0 ? "text-green-600" : "text-destructive")}>
                        {pnl >= 0 ? "+" : ""}{formatEur(pnl)} € ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <ImageCarousel images={ticket.photos} />

        <p className={cn("text-sm text-muted-foreground leading-relaxed whitespace-pre-line", !expanded && "line-clamp-4")}>
          {ticket.description}
        </p>
        {ticket.description.length > 280 && (
          <button onClick={() => setExpanded(!expanded)} className="mt-2 text-sm text-primary hover:text-primary/80 font-medium">
            {expanded ? "Voir moins" : "Lire la suite"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export default function CryptoLogbookPage() {
  const { tickets, loaded } = useCryptoTicketStore();
  const { prices, loading: pricesLoading, error: pricesError, refresh, lastUpdated } = useCryptoPrices();

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Crypto — Carnet de bord</h1>
          <p className="text-muted-foreground">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={refresh}
            disabled={pricesLoading}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", pricesLoading && "animate-spin")} />
            Actualiser les cours
          </button>
          {lastUpdated && !pricesLoading && (
            <span className="text-[11px] text-muted-foreground">
              Mis à jour {lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {pricesError && <span className="text-[11px] text-destructive">Erreur CoinGecko</span>}
        </div>
      </div>

      {loaded && tickets.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">₿</p>
          <p className="text-muted-foreground">Aucun ticket crypto pour l&apos;instant.</p>
        </div>
      )}

      <div className="space-y-4">
        {tickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} prices={prices} pricesLoading={pricesLoading} />
        ))}
      </div>
    </div>
  );
}
