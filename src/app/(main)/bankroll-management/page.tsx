"use client";

import { BANKROLL_TIERS } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/hooks/useSessionStore";

function TierCard({ tier, current }: { tier: (typeof BANKROLL_TIERS)[0]; current: number }) {
  const isActive = current >= tier.minAmount && (tier.maxAmount === null || current < tier.maxAmount);
  const isPast = tier.maxAmount !== null && current >= tier.maxAmount;

  const progress = (() => {
    if (current < tier.minAmount) return 0;
    if (tier.maxAmount === null) return Math.min(((current - tier.minAmount) / (tier.minAmount * 0.5)) * 100, 100);
    if (isPast) return 100;
    return Math.min(((current - tier.minAmount) / (tier.maxAmount - tier.minAmount)) * 100, 100);
  })();

  return (
    <Card className={cn(
      "transition-all",
      isActive && "border-primary/60 bg-primary/5",
      isPast && "border-blue-400/40",
    )}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={cn(
            "font-semibold text-sm",
            isActive ? "text-primary" : isPast ? "text-blue-400" : "text-muted-foreground"
          )}>
            {tier.label}
          </span>
          {isActive && (
            <Badge variant="outline" className="text-primary border-primary/40 gap-1 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Actuel
            </Badge>
          )}
        </div>
        <div className="relative h-7 rounded-full overflow-hidden bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isActive ? "bg-primary" : isPast ? "bg-blue-400" : "bg-muted-foreground/30"
            )}
            style={{ width: `${progress}%` }}
          />
          <span className={cn(
            "absolute inset-0 flex items-center justify-center text-xs font-semibold",
            progress > 50
              ? (isActive ? "text-primary-foreground" : "text-white")
              : (isActive ? "text-primary" : "text-muted-foreground")
          )}>
            {Math.round(progress)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BankrollManagementPage() {
  const { currentBankroll } = useSessionStore();
  const CURRENT_BANKROLL = currentBankroll.total;
  const currentTier = BANKROLL_TIERS.find(
    (t) => CURRENT_BANKROLL >= t.minAmount && (t.maxAmount === null || CURRENT_BANKROLL < t.maxAmount)
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Bankroll Management</h1>
      </div>

      {/* Bankroll actuelle */}
      <Card className="mb-8 border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Bankroll actuelle</div>
              <div className="text-3xl font-bold text-primary">
                {CURRENT_BANKROLL.toLocaleString("fr-FR")}€
              </div>
            </div>
            {currentTier && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Palier en cours</div>
                <div className="font-semibold">{currentTier.label}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Jauges */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {BANKROLL_TIERS.map((tier) => (
          <TierCard key={tier.label} tier={tier} current={CURRENT_BANKROLL} />
        ))}
      </div>

      {/* Palier actuel détail */}
      {currentTier && (
        <Card className="mb-10 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base text-primary">Palier actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Tournois</div>
                <div className="font-semibold">{currentTier.tournaments}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Expressos</div>
                <div className="font-semibold">{currentTier.expressos}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Buy-in minimum</div>
                <div className="font-semibold text-xs leading-relaxed">{currentTier.minBuyIn}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau récap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Récapitulatif des paliers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bankroll</TableHead>
                <TableHead>Tournois</TableHead>
                <TableHead>Expressos</TableHead>
                <TableHead className="hidden sm:table-cell">Buy-in min.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BANKROLL_TIERS.map((tier) => {
                const isActive = CURRENT_BANKROLL >= tier.minAmount && (tier.maxAmount === null || CURRENT_BANKROLL < tier.maxAmount);
                return (
                  <TableRow key={tier.label} className={isActive ? "bg-primary/5" : ""}>
                    <TableCell className={cn("font-medium", isActive && "text-primary")}>{tier.label}</TableCell>
                    <TableCell>{tier.tournaments}</TableCell>
                    <TableCell>{tier.expressos}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{tier.minBuyIn}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
