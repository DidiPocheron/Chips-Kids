"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Euro,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useStockQuotes, type QuotesResponse } from "@/hooks/useStockQuotes";
import { STOCK_POSITIONS, CRYPTO_POSITIONS, type StockPosition } from "@/data/stockPositions";
import { Spinner } from "@/components/ui/spinner";

const REFRESH_MS = 90_000;

function formatEUR(n: number) {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

const NATIVE_SYMBOL: Record<string, string> = {
  EUR: "€",
  USD: "$",
  CAD: "CAD",
  JPY: "¥",
  GBX: "GBX",
};

function formatNative(value: number, currency: string) {
  const decimals = currency === "JPY" ? 0 : 2;
  const formatted = value.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const symbol = NATIVE_SYMBOL[currency] ?? currency;
  return currency === "EUR" || currency === "USD" ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
}

function normalizeCurrency(cur: string) {
  return cur === "GBp" || cur === "GBX" ? "GBP" : cur;
}

interface StockValuation {
  isLive: boolean;
  canConvert: boolean;
  nativePrice: number | null;
  displayCurrency: string;
  valueEur: number | null;
  costEur: number | null;
  plEur: number | null;
  plPct: number | null;
}

function valuateStock(pos: StockPosition, data: QuotesResponse | null): StockValuation {
  const quote = data?.quotes?.[pos.yahooSymbol] ?? null;
  const liveCurrency = quote?.currency ?? (pos.currency === "GBX" ? "GBp" : pos.currency);
  const isPence = liveCurrency === "GBp" || pos.currency === "GBX";

  const nativePrice = quote ? quote.price : null;
  const rateCurrency = normalizeCurrency(liveCurrency);
  const fxRate = rateCurrency === "EUR" ? 1 : data?.fx?.[rateCurrency] ?? null;
  const canConvert = rateCurrency === "EUR" || typeof fxRate === "number";

  // Fallback : pas de cours en direct -> on valorise au PRU (flag "indisponible").
  const priceForValuation = nativePrice ?? pos.pru;
  const priceMainUnit = isPence ? priceForValuation / 100 : priceForValuation;
  const pruMainUnit = isPence ? pos.pru / 100 : pos.pru;

  const valueEur = canConvert ? pos.quantity * priceMainUnit * (fxRate ?? 1) : null;
  const costEur = canConvert ? pos.quantity * pruMainUnit * (fxRate ?? 1) : null;
  const plEur = valueEur !== null && costEur !== null ? valueEur - costEur : null;
  const plPct = plEur !== null && costEur ? (plEur / costEur) * 100 : null;

  return {
    isLive: !!quote,
    canConvert,
    nativePrice: nativePrice ?? pos.pru,
    displayCurrency: pos.currency,
    valueEur,
    costEur,
    plEur,
    plPct,
  };
}

function PLBadge({ value }: { value: number | null }) {
  if (value === null) return <Badge variant="outline">Indispo.</Badge>;
  const isUp = value >= 0;
  return (
    <span className={cn("tabular-nums font-medium", isUp ? "text-primary" : "text-destructive")}>
      {isUp ? "+" : ""}
      {value.toFixed(2)} %
    </span>
  );
}

export default function PortefeuillePage() {
  const { prices: cryptoPrices, loading: cryptoLoading, lastUpdated: cryptoUpdated } = useCryptoPrices();
  const { data: stockData, loading: stockLoading, error: stockError, refresh } = useStockQuotes(REFRESH_MS);

  const cryptoRows = useMemo(
    () =>
      CRYPTO_POSITIONS.map((pos) => {
        const price = cryptoPrices[pos.coingeckoId] ?? null;
        const isLive = price !== null;
        const priceForValuation = price ?? pos.pru;
        const valueEur = pos.quantity * priceForValuation;
        const costEur = pos.quantity * pos.pru;
        const plEur = valueEur - costEur;
        const plPct = costEur > 0 ? (plEur / costEur) * 100 : 0;
        return { pos, isLive, price: priceForValuation, valueEur, costEur, plEur, plPct };
      }),
    [cryptoPrices]
  );

  const stockRows = useMemo(
    () => STOCK_POSITIONS.map((pos) => ({ pos, val: valuateStock(pos, stockData) })),
    [stockData]
  );

  const totals = useMemo(() => {
    let value = 0;
    let cost = 0;
    let unresolved = 0;
    let stale = 0;

    for (const row of cryptoRows) {
      value += row.valueEur;
      cost += row.costEur;
      if (!row.isLive) stale++;
    }
    for (const { val } of stockRows) {
      if (val.valueEur !== null && val.costEur !== null) {
        value += val.valueEur;
        cost += val.costEur;
      } else {
        unresolved++;
      }
      if (!val.isLive) stale++;
    }

    const pl = value - cost;
    const pct = cost > 0 ? (pl / cost) * 100 : 0;
    return { value, cost, pl, pct, unresolved, stale };
  }, [cryptoRows, stockRows]);

  const isUp = totals.pl >= 0;
  const lastUpdatedLabel = stockData
    ? new Date(stockData.fetchedAt).toLocaleTimeString("fr-FR")
    : cryptoUpdated
    ? cryptoUpdated.toLocaleTimeString("fr-FR")
    : null;

  return (
    <>
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-1">Portefeuille — Suivi en direct</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-muted-foreground text-sm">
              Valorisation en temps quasi réel de toutes les lignes (actions internationales + crypto).
            </p>
            <Link
              href="/bourse"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-md px-2 py-1 shrink-0"
            >
              <ArrowLeft className="w-3 h-3" /> Bourse
            </Link>
          </div>
        </div>
        <Button
          onClick={refresh}
          size="sm"
          variant="outline"
          className="gap-2"
          disabled={stockLoading}
        >
          <RefreshCw className={cn("w-4 h-4", stockLoading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Euro className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Valeur totale</span>
            </div>
            <div className="text-2xl font-bold text-blue-400 tabular-nums">{formatEUR(totals.value)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              {isUp ? (
                <TrendingUp className="w-4 h-4 text-primary" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm text-muted-foreground">P&amp;L latent</span>
            </div>
            <div className={cn("text-2xl font-bold tabular-nums", isUp ? "text-primary" : "text-destructive")}>
              {totals.pl >= 0 ? "+" : ""}
              {formatEUR(totals.pl)}
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
              {totals.pct >= 0 ? "+" : ""}
              {totals.pct.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground mb-8 flex flex-wrap items-center gap-x-3 gap-y-1">
        {lastUpdatedLabel && <span>Dernière mise à jour : {lastUpdatedLabel}</span>}
        <span>Rafraîchissement auto toutes les {REFRESH_MS / 1000}s</span>
        {stockError && <span className="text-destructive">Cours actions momentanément indisponibles.</span>}
        {totals.stale > 0 && (
          <span>{totals.stale} ligne(s) valorisée(s) au PRU (cours en direct indisponible).</span>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Crypto</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Qté</TableHead>
                <TableHead className="text-right">Cours</TableHead>
                <TableHead className="text-right">Valeur</TableHead>
                <TableHead className="text-right">P/L latent</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cryptoRows.map(({ pos, isLive, price, valueEur, plEur, plPct }) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-medium">
                    {pos.name}
                    {!isLive && (
                      <Badge variant="outline" className="ml-2">
                        PRU
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{pos.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEUR(price)}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{formatEUR(valueEur)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums font-medium",
                      plEur >= 0 ? "text-primary" : "text-destructive"
                    )}
                  >
                    {plEur >= 0 ? "+" : ""}
                    {formatEUR(plEur)}
                  </TableCell>
                  <TableCell className="text-right">
                    <PLBadge value={plPct} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {cryptoLoading && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
              <Spinner className="w-3.5 h-3.5" />
              Chargement des cours crypto…
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Place</TableHead>
                <TableHead className="text-right">Qté</TableHead>
                <TableHead className="text-right">Cours</TableHead>
                <TableHead className="text-right">Valeur</TableHead>
                <TableHead className="text-right">P/L latent</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockRows.map(({ pos, val }) => (
                <TableRow key={pos.id + pos.ticker + pos.market}>
                  <TableCell className="font-medium">
                    {pos.name}
                    {!val.isLive && (
                      <Badge variant="outline" className="ml-2">
                        {val.canConvert ? "PRU" : "Indispo."}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{pos.market}</TableCell>
                  <TableCell className="text-right tabular-nums">{pos.quantity.toLocaleString("fr-FR")}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {val.nativePrice !== null ? formatNative(val.nativePrice, pos.currency) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {val.valueEur !== null ? formatEUR(val.valueEur) : "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums font-medium",
                      val.plEur === null ? "text-muted-foreground" : val.plEur >= 0 ? "text-primary" : "text-destructive"
                    )}
                  >
                    {val.plEur === null ? "—" : `${val.plEur >= 0 ? "+" : ""}${formatEUR(val.plEur)}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <PLBadge value={val.plPct} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground leading-relaxed mt-6">
        Cours actions fournis par Yahoo Finance (léger différé possible selon la place boursière). Cours crypto
        fournis par CoinGecko. Certaines petites capitalisations peu suivies peuvent occasionnellement ne pas
        renvoyer de cours à jour — la ligne est alors valorisée à son PRU et signalée par un badge.
      </p>
    </div>
    </>
  );
}
