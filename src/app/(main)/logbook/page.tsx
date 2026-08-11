"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSessionStore } from "@/hooks/useSessionStore";
import { cn } from "@/lib/utils";
import { getDayNumber, CHALLENGE_INITIAL } from "@/lib/config";
import { RATING_CONFIG, RATING_OPTIONS } from "@/lib/ratings";
import type { SessionPost, SessionRating } from "@/types";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ImageCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) return null;

  return (
    <>
      <div className="relative bg-muted rounded-lg overflow-hidden h-56 mb-4">
        <img
          src={images[idx]}
          alt={`Photo ${idx + 1}`}
          className="w-full h-full object-contain cursor-zoom-in"
          onClick={() => setLightbox(true)}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
          <img
            src={images[idx]}
            alt="Aperçu"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function SessionCard({ post, prevTotal }: { post: SessionPost; prevTotal: number | null }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RATING_CONFIG[post.rating];
  const delta = prevTotal !== null ? post.bankroll.total - prevTotal : null;
  const deltaPct = delta !== null && prevTotal ? (delta / prevTotal) * 100 : null;
  const deltaStart = post.bankroll.total - CHALLENGE_INITIAL;
  const deltaStartPct = (deltaStart / CHALLENGE_INITIAL) * 100;
  const isLong = post.description.length > 280;

  return (
    <Card className={cn("border-l-4 hover:shadow-md transition-shadow", cfg.accent)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <img src={cfg.src} alt={cfg.label} className="w-12 h-12 object-contain" />
            <div>
              <div className={cn("font-semibold text-sm", cfg.color)}>{cfg.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {formatDate(post.date)} · <span className="font-medium">Jour {getDayNumber(post.date)}</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold tabular-nums">
              {post.bankroll.total.toLocaleString("fr-FR")}€
            </div>
            <div className="space-y-0.5">
              {delta !== null && (
                <div className={cn("text-xs font-medium tabular-nums", delta >= 0 ? "text-green-600" : "text-destructive")}>
                  <span className="text-muted-foreground mr-1">Session</span>
                  {delta >= 0 ? "+" : ""}{delta.toLocaleString("fr-FR")}€
                  {deltaPct !== null && <span className="ml-1 opacity-70">({deltaPct >= 0 ? "+" : ""}{deltaPct.toFixed(1)}%)</span>}
                </div>
              )}
              <div className={cn("text-xs tabular-nums opacity-60", deltaStart >= 0 ? "text-green-600" : "text-destructive")}>
                <span className="text-muted-foreground mr-1">Progression</span>
                {deltaStart >= 0 ? "+" : ""}{deltaStart.toLocaleString("fr-FR")}€
                <span className="ml-1">({deltaStartPct >= 0 ? "+" : ""}{deltaStartPct.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        <ImageCarousel images={post.photos} />

        <p className={cn(
          "text-sm text-muted-foreground leading-relaxed whitespace-pre-line",
          isLong && !expanded && "line-clamp-4"
        )}>
          {post.description}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-sm text-primary hover:text-primary/80 font-medium"
          >
            {expanded ? "Voir moins" : "Lire la suite"}
          </button>
        )}

        <div className="flex gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
          <span>Winamax <span className="font-medium text-foreground tabular-nums">{post.bankroll.winamax}€</span></span>
          <span>PokerStars <span className="font-medium text-foreground tabular-nums">{post.bankroll.pokerstars}€</span></span>
          <span>Porte-monnaie <span className="font-medium text-foreground tabular-nums">{post.bankroll.wallet}€</span></span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LogbookPage() {
  const { sessions, loaded } = useSessionStore();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<SessionRating | "all">("all");

  const months = sessions.reduce<{ value: string; label: string }[]>((acc, post) => {
    const d = new Date(post.date + "T12:00:00");
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    if (!acc.find((m) => m.value === value)) acc.push({ value, label });
    return acc;
  }, []).sort((a, b) => b.value.localeCompare(a.value));

  const filtered = sessions
    .filter((p) => {
      if (selectedMonth === "all") return true;
      const d = new Date(p.date + "T12:00:00");
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === selectedMonth;
    })
    .filter((p) => selectedRating === "all" || p.rating === selectedRating);

  const grouped = filtered.reduce<Record<string, SessionPost[]>>((acc, post) => {
    const label = new Date(post.date + "T12:00:00").toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    if (!acc[label]) acc[label] = [];
    acc[label].push(post);
    return acc;
  }, {});

  function getPrevTotal(post: SessionPost): number | null {
    const idx = sessions.findIndex((s) => s.id === post.id);
    if (idx === sessions.length - 1) return null;
    return sessions[idx + 1].bankroll.total;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Carnet de bord</h1>
        <p className="text-muted-foreground">{sessions.length} session{sessions.length !== 1 ? "s" : ""} documentée{sessions.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filtres */}
      <div className="space-y-3 mb-8">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Tous les mois</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedRating("all")}
            className={cn(
              "h-16 px-4 rounded-xl border-2 text-xs font-medium transition-all",
              selectedRating === "all"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-foreground/30"
            )}
          >
            Tous
          </button>
          {RATING_OPTIONS.map((r) => {
            const cfg = RATING_CONFIG[r.value];
            return (
              <button
                key={r.value}
                onClick={() => setSelectedRating(r.value)}
                title={cfg.label}
                className={cn(
                  "w-16 h-16 rounded-xl border-2 transition-all overflow-hidden",
                  selectedRating === r.value
                    ? "border-primary shadow-md"
                    : "border-transparent hover:border-border"
                )}
              >
                <img src={cfg.src} alt={cfg.label} className="w-full h-full object-contain" />
              </button>
            );
          })}
        </div>
      </div>

      {/* État vide */}
      {loaded && sessions.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🃏</p>
          <p className="text-muted-foreground">Aucune session pour l&apos;instant.</p>
        </div>
      )}

      {/* Sessions */}
      <div className="space-y-12">
        {Object.entries(grouped).map(([month, posts]) => (
          <div key={month}>
            <h2 className="text-lg font-bold mb-4 capitalize">{month}</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <SessionCard key={post.id} post={post} prevTotal={getPrevTotal(post)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
