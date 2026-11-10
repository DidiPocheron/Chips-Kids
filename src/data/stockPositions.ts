// Portefeuille actions & crypto — positions détenues.
// PRU = Prix de Revient Unitaire, exprimé dans la devise native de la ligne
// (sauf pour le crypto où tout est déjà en EUR).
//
// Le "yahooSymbol" est le ticker utilisé pour interroger Yahoo Finance
// (src/app/api/quotes/route.ts). Pour les valeurs japonaises, c'est le code
// à 4 chiffres + ".T" (Tokyo Stock Exchange) — mapping fiable à 100%.
// Pour "Groupe Partouche SA (Tradegate/Francfort)" et les deux lignes Xetra
// (Aroundtown, Hornbach), Yahoo Finance ne référence pas toujours la place
// exacte affichée dans le courtier (TDG/FRA) : on réutilise le ticker Xetra/
// Euronext le plus proche pour avoir un cours en continu.

export type PositionCurrency = "EUR" | "USD" | "CAD" | "JPY" | "GBX";

export interface StockPosition {
  id: string;
  name: string;
  ticker: string;
  isin?: string;
  market: string;
  yahooSymbol: string;
  currency: PositionCurrency;
  quantity: number;
  pru: number;
}

export const STOCK_POSITIONS: StockPosition[] = [
  { id: "aroundtown", name: "Aroundtown SA", ticker: "AT1", isin: "LU1673108939", market: "Xetra (TDG)", yahooSymbol: "AT1.DE", currency: "EUR", quantity: 300, pru: 1.74325 },
  { id: "charle", name: "Charle Co Ltd", ticker: "9885", isin: "JP3359800004", market: "Tokyo (TSE)", yahooSymbol: "9885.T", currency: "JPY", quantity: 100, pru: 355.00 },
  { id: "crest-nicholson", name: "Crest Nicholson Holdings", ticker: "CRST", isin: "GB00B8VZXT93", market: "Londres (LSE)", yahooSymbol: "CRST.L", currency: "GBX", quantity: 775, pru: 141.025806 },
  { id: "dai-ichi-cutter", name: "Dai-Ichi Cutter Kogyo KK", ticker: "1716", isin: "JP3473700007", market: "Tokyo (TSE)", yahooSymbol: "1716.T", currency: "JPY", quantity: 300, pru: 1351.00 },
  { id: "partouche-epa", name: "Groupe Partouche SA", ticker: "PARP", isin: "FR0012612646", market: "Euronext Paris (EPA)", yahooSymbol: "PARP.PA", currency: "EUR", quantity: 30, pru: 19.70 },
  { id: "partouche-fra", name: "Groupe Partouche SA", ticker: "PZ21", isin: "FR0012612646", market: "Francfort (FRA)", yahooSymbol: "PARP.PA", currency: "EUR", quantity: 15, pru: 19.70 },
  { id: "hornbach", name: "Hornbach Holding AG & Co", ticker: "HBH", isin: "DE0006083405", market: "Xetra (TDG)", yahooSymbol: "HBH.DE", currency: "EUR", quantity: 4, pru: 64.20 },
  { id: "keihin", name: "Keihin Co Ltd", ticker: "9312", isin: "JP3279800001", market: "Tokyo (TSE)", yahooSymbol: "9312.T", currency: "JPY", quantity: 100, pru: 2221.00 },
  { id: "koa-shoji", name: "Koa Shoji Holdings Co Ltd", ticker: "9273", isin: "JP3283420002", market: "Tokyo (TSE)", yahooSymbol: "9273.T", currency: "JPY", quantity: 300, pru: 845.666666 },
  { id: "kunimine", name: "Kunimine Industries Co Ltd", ticker: "5388", isin: "JP3266200009", market: "Tokyo (TSE)", yahooSymbol: "5388.T", currency: "JPY", quantity: 100, pru: 1085.00 },
  { id: "maruzen", name: "Maruzen Co Ltd", ticker: "5982", isin: "JP3875610002", market: "Tokyo (TSE)", yahooSymbol: "5982.T", currency: "JPY", quantity: 100, pru: 3895.00 },
  { id: "melcor", name: "Melcor Developments Ltd", ticker: "MRD", isin: "CA5854671032", market: "Toronto (TOR)", yahooSymbol: "MRD.TO", currency: "CAD", quantity: 100, pru: 11.10 },
  { id: "nansin", name: "Nansin Co Ltd", ticker: "7399", isin: "JP3653300008", market: "Tokyo (TSE)", yahooSymbol: "7399.T", currency: "JPY", quantity: 100, pru: 532.00 },
  { id: "nichia-steel", name: "Nichia Steel Works Ltd", ticker: "5658", isin: "JP3660000005", market: "Tokyo (TSE)", yahooSymbol: "5658.T", currency: "JPY", quantity: 500, pru: 380.80 },
  { id: "nisshin-group", name: "Nisshin Group Holdings Co", ticker: "8881", isin: "JP3677900007", market: "Tokyo (TSE)", yahooSymbol: "8881.T", currency: "JPY", quantity: 100, pru: 345.00 },
  { id: "nisso-group", name: "Nisso Group Co Ltd", ticker: "3440", isin: "JP3679830004", market: "Tokyo (TSE)", yahooSymbol: "3440.T", currency: "JPY", quantity: 200, pru: 1052.50 },
  { id: "o-well", name: "O-Well Corp", ticker: "7670", isin: "JP3170180008", market: "Tokyo (TSE)", yahooSymbol: "7670.T", currency: "JPY", quantity: 100, pru: 985.00 },
  { id: "petrotal", name: "Petrotal Corp", ticker: "TAL", isin: "CA71677J1012", market: "Toronto (TOR)", yahooSymbol: "TAL.TO", currency: "CAD", quantity: 3500, pru: 0.38 },
  { id: "sanko", name: "Sanko Co Ltd", ticker: "6964", isin: "JP3330400007", market: "Tokyo (TSE)", yahooSymbol: "6964.T", currency: "JPY", quantity: 200, pru: 576.00 },
  { id: "sanko-sangyo", name: "Sanko Sangyo Co Ltd", ticker: "7922", isin: "JP3331000004", market: "Tokyo (TSE)", yahooSymbol: "7922.T", currency: "JPY", quantity: 200, pru: 357.00 },
  { id: "tsubakimoto", name: "Tsubakimoto Kogyo Co Ltd", ticker: "8052", isin: "JP3534600006", market: "Tokyo (TSE)", yahooSymbol: "8052.T", currency: "JPY", quantity: 100, pru: 1996.00 },
  { id: "vislink", name: "Vislink Technologies Inc", ticker: "VISL", isin: "US92836Y4098", market: "OTC", yahooSymbol: "VISL", currency: "USD", quantity: 100, pru: 2.50 },
  { id: "wakita", name: "Wakita & Co Ltd", ticker: "8125", isin: "JP3992000004", market: "Tokyo (TSE)", yahooSymbol: "8125.T", currency: "JPY", quantity: 200, pru: 1650.50 },
  { id: "western-forest", name: "Western Forest Products Inc", ticker: "WEF", isin: "CA9582117086", market: "Toronto (TOR)", yahooSymbol: "WEF.TO", currency: "CAD", quantity: 100, pru: 13.425 },
];

export interface CryptoPosition {
  id: string;
  name: string;
  ticker: string;
  coingeckoId: "bitcoin" | "ethereum" | "solana";
  quantity: number;
  pru: number; // en EUR
}

export const CRYPTO_POSITIONS: CryptoPosition[] = [
  { id: "btc", name: "Bitcoin", ticker: "BTC", coingeckoId: "bitcoin", quantity: 0.00357, pru: 56063.82 },
  { id: "eth", name: "Ethereum", ticker: "ETH", coingeckoId: "ethereum", quantity: 0.214592, pru: 2328.38 },
  { id: "sol", name: "Solana", ticker: "SOL", coingeckoId: "solana", quantity: 4.15187, pru: 120.533999 },
];
