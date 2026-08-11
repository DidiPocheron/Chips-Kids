"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { GameFormat, BetAmount, BetCounts } from "@/types";

const FORMATS: { value: GameFormat; label: string }[] = [
  { value: "tournois", label: "🎯 Tournois" },
  { value: "expresso", label: "⚡ Expresso" },
  { value: "cashgame", label: "💰 Cash Game" },
];

const BET_BUTTONS: Record<GameFormat, { amount: BetAmount }[]> = {
  tournois: [
    { amount: "10€" },
    { amount: "20€" },
    { amount: "50€" },
    { amount: "100€" },
  ],
  expresso: [
    { amount: "5€" },
    { amount: "12€" },
    { amount: "25€" },
  ],
  cashgame: [],
};

const INITIAL_BETS: BetCounts = {
  "5€": 0, "10€": 0, "12€": 0, "20€": 0, "25€": 0, "50€": 0, "100€": 0,
};

const BET_VALUES: Record<BetAmount, number> = {
  "5€": 5, "10€": 10, "12€": 12, "20€": 20, "25€": 25, "50€": 50, "100€": 100,
};

export default function SessionTrackerPage() {
  const [format, setFormat] = useState<GameFormat>("tournois");
  const [startBR, setStartBR] = useState("");
  const [endBR, setEndBR] = useState("");
  const [bets, setBets] = useState<BetCounts>(INITIAL_BETS);

  const increment = useCallback((amount: BetAmount) => {
    setBets((prev) => ({ ...prev, [amount]: prev[amount] + 1 }));
  }, []);

  const decrement = useCallback((amount: BetAmount) => {
    setBets((prev) => ({ ...prev, [amount]: Math.max(0, prev[amount] - 1) }));
  }, []);

  const reset = () => {
    setStartBR("");
    setEndBR("");
    setBets(INITIAL_BETS);
  };

  const profit = parseFloat(endBR || "0") - parseFloat(startBR || "0");

  const totalInvested = BET_BUTTONS[format].reduce((acc, { amount }) => {
    return acc + BET_VALUES[amount] * bets[amount];
  }, 0);

  const roi = totalInvested > 0 ? ((profit / totalInvested) * 100).toFixed(1) : null;

  const isProfit = profit >= 0;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Tracker de session</h1>
        <p className="text-muted-foreground">Suivi en direct de ta session</p>
      </div>

      {/* Format selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FORMATS.map(({ value, label }) => (
          <Button
            key={value}
            variant={format === value ? "default" : "outline"}
            size="sm"
            onClick={() => setFormat(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Bankroll */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bankroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="startBR">Bankroll début (€)</Label>
                <Input
                  id="startBR"
                  type="number"
                  placeholder="Ex: 4800"
                  value={startBR}
                  onChange={(e) => setStartBR(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endBR">Bankroll fin (€)</Label>
                <Input
                  id="endBR"
                  type="number"
                  placeholder="Ex: 4850"
                  value={endBR}
                  onChange={(e) => setEndBR(e.target.value)}
                />
              </div>
            </div>
            {startBR && endBR && (
              <div className={cn(
                "text-2xl font-bold",
                isProfit ? "text-primary" : "text-destructive"
              )}>
                {isProfit ? "+" : ""}{profit.toFixed(0)}€
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bet counter */}
        {BET_BUTTONS[format].length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Buy-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {BET_BUTTONS[format].map(({ amount }) => (
                  <div key={amount} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-12">{amount}</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => decrement(amount)}
                        disabled={bets[amount] === 0}
                      >
                        −
                      </Button>
                      <span className="w-8 text-center font-bold text-primary">
                        {bets[amount]}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => increment(amount)}
                      >
                        +
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground w-20 text-right">
                      = {(BET_VALUES[amount] * bets[amount]).toLocaleString("fr-FR")}€
                    </span>
                  </div>
                ))}
              </div>

              {totalInvested > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total investi</span>
                    <span className="font-semibold">{totalInvested.toLocaleString("fr-FR")}€</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Résumé */}
        {(startBR || endBR) && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Résumé de session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                {startBR && endBR && (
                  <>
                    <span className="text-muted-foreground">Profit / Perte</span>
                    <span className={cn("font-bold text-right", isProfit ? "text-primary" : "text-destructive")}>
                      {isProfit ? "+" : ""}{profit.toFixed(0)}€
                    </span>
                  </>
                )}
                {roi && (
                  <>
                    <span className="text-muted-foreground">ROI</span>
                    <span className={cn("font-bold text-right", parseFloat(roi) >= 0 ? "text-primary" : "text-destructive")}>
                      {parseFloat(roi) >= 0 ? "+" : ""}{roi}%
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Button variant="outline" className="w-full" onClick={reset}>
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
