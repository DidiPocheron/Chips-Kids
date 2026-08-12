"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCryptoLogStore } from "@/hooks/useCryptoLogStore";
import { IS_ADMIN } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { CryptoOperationType } from "@/types";

const TYPES: { value: CryptoOperationType; label: string; color: string }[] = [
  { value: "achat",     label: "Achat",     color: "border-primary bg-primary/10 text-primary" },
  { value: "vente",     label: "Vente",     color: "border-destructive bg-destructive/10 text-destructive" },
  { value: "staking",   label: "Staking",   color: "border-blue-400 bg-blue-400/10 text-blue-400" },
  { value: "dca",       label: "DCA",       color: "border-purple-400 bg-purple-400/10 text-purple-400" },
  { value: "transfert", label: "Transfert", color: "border-orange-400 bg-orange-400/10 text-orange-400" },
  { value: "autre",     label: "Autre",     color: "border-muted-foreground bg-muted text-muted-foreground" },
];

export default function NewCryptoEntryPage() {
  const router = useRouter();
  const { addEntry } = useCryptoLogStore();

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [type, setType] = useState<CryptoOperationType | null>(null);
  const [crypto, setCrypto] = useState("");
  const [quantity, setQuantity] = useState("");
  const [valueEur, setValueEur] = useState("");
  const [platform, setPlatform] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!IS_ADMIN) router.replace("/crypto/logbook"); }, [router]);
  if (!IS_ADMIN) return null;

  async function handleSubmit() {
    if (!type) { setError("Choisis un type d'opération."); return; }
    if (!crypto.trim()) { setError("Indique la cryptomonnaie."); return; }
    if (!valueEur) { setError("Indique la valeur en €."); return; }
    setError(""); setSaving(true);
    await addEntry({
      date,
      type,
      crypto: crypto.trim().toUpperCase(),
      quantity: parseFloat(quantity) || 0,
      valueEur: parseFloat(valueEur),
      platform: platform.trim(),
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    router.push("/crypto/logbook");
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/crypto/logbook">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Nouvelle opération</h1>
      </div>

      <div className="space-y-6">
        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-44" />
        </div>

        {/* Type */}
        <div className="space-y-3">
          <Label>Type d&apos;opération</Label>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={cn(
                  "py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all",
                  type === t.value ? t.color + " border-2" : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Détails */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="font-medium text-sm">Détails de l&apos;opération</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="crypto" className="text-xs text-muted-foreground">Cryptomonnaie</Label>
                <Input id="crypto" placeholder="BTC, ETH, SOL…" value={crypto} onChange={e => setCrypto(e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="platform" className="text-xs text-muted-foreground">Plateforme</Label>
                <Input id="platform" placeholder="Binance, Coinbase…" value={platform} onChange={e => setPlatform(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-xs text-muted-foreground">Quantité</Label>
                <Input id="quantity" type="number" min="0" step="any" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="valueEur" className="text-xs text-muted-foreground">Valeur (€)</Label>
                <div className="relative">
                  <Input id="valueEur" type="number" min="0" step="0.01" placeholder="0" value={valueEur} onChange={e => setValueEur(e.target.value)} className="pr-7" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note */}
        <div className="space-y-2">
          <Label htmlFor="note">Note <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
          <textarea
            id="note"
            rows={3}
            placeholder="Contexte, stratégie, observations…"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer l'opération"}
        </Button>
      </div>
    </div>
  );
}
