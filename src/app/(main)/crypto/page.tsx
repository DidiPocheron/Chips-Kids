"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankrollChart } from "@/components/bankroll/BankrollChart";
import { CryptoTicketCharts } from "@/components/crypto/CryptoTicketCharts";
import { TrendingUp, TrendingDown, Euro, Percent, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/hooks/usePortfolioStore";
import { useCryptoTicketStore } from "@/hooks/useCryptoTicketStore";
import { IS_ADMIN } from "@/lib/config";

const COLLECTION = "portfolio_crypto";

export default function CryptoPage() {
  const { entries, addEntry, deleteEntry, currentAmount, firstAmount, loaded } = usePortfolioStore(COLLECTION);
  const { tickets } = useCryptoTicketStore();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const chartEntries = useMemo(() =>
    [...entries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({ id: e.id, date: new Date(e.date), amount: e.amount })),
    [entries]
  );

  const pnl = currentAmount - firstAmount;
  const pct = firstAmount > 0 ? (pnl / firstAmount) * 100 : 0;
  const isUp = pnl >= 0;
  const hasData = entries.length > 0;

  async function handleSubmit() {
    if (!amount) return;
    setSaving(true);
    await addEntry({ date, amount: parseFloat(amount), ...(note.trim() ? { note: note.trim() } : {}) });
    setAmount(""); setNote(""); setShowForm(false); setSaving(false);
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Crypto</h1>
          <p className="text-muted-foreground text-sm">Portefeuille cryptomonnaies</p>
        </div>
        {IS_ADMIN && (
          <Button onClick={() => setShowForm(!showForm)} size="sm" variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Mettre à jour
          </Button>
        )}
      </div>

      {showForm && IS_ADMIN && (
        <Card className="mb-8">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Valeur (€)</Label>
                <div className="relative">
                  <Input type="number" min="0" step="0.01" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} className="pr-7" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Note <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                <Input placeholder="Contexte..." value={note} onChange={e => setNote(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={saving || !amount}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasData && loaded && tickets.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p>Aucune donnée pour l&apos;instant.</p>
          {IS_ADMIN && <p className="text-sm mt-1">Clique sur &quot;Mettre à jour&quot; pour ajouter la valeur actuelle.</p>}
        </div>
      ) : (
        <>
          {hasData && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Euro className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Valeur actuelle</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-400 tabular-nums">
                      {currentAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      {isUp ? <TrendingUp className="w-4 h-4 text-primary" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                      <span className="text-sm text-muted-foreground">P&amp;L</span>
                    </div>
                    <div className={cn("text-2xl font-bold tabular-nums", isUp ? "text-primary" : "text-destructive")}>
                      {pnl >= 0 ? "+" : ""}{pnl.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Percent className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Évolution</span>
                    </div>
                    <div className={cn("text-2xl font-bold", isUp ? "text-primary" : "text-destructive")}>
                      {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {chartEntries.length > 1 && (
                <Card className="mb-8">
                  <CardHeader><CardTitle className="text-base">Évolution du portefeuille</CardTitle></CardHeader>
                  <CardContent><BankrollChart entries={chartEntries} /></CardContent>
                </Card>
              )}
            </>
          )}

          {tickets.length > 0 && (
            <Card className="mb-8">
              <CardHeader><CardTitle className="text-base">Évolution par ticket</CardTitle></CardHeader>
              <CardContent><CryptoTicketCharts tickets={tickets} /></CardContent>
            </Card>
          )}

          {IS_ADMIN && entries.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Historique</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entries.map(e => (
                    <div key={e.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{e.date}</span>
                      <span className="font-medium tabular-nums">{e.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span>
                      {e.note && <span className="text-muted-foreground text-xs">{e.note}</span>}
                      <button onClick={() => deleteEntry(e.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-2">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
