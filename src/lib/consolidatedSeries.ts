// Construit la série "total consolidé" (poker + bourse + crypto) dans le temps
// à partir de trois sources indépendamment datées. Chaque source a sa propre
// cadence (une session poker, un ticket bourse, une entrée crypto manuelle ne
// tombent jamais aux mêmes dates) -- on ne peut donc pas simplement les
// superposer : on construit la liste de toutes les dates connues, puis pour
// chaque date on reporte la DERNIÈRE valeur connue de chaque source (0 avant
// sa toute première entrée, ce qui reflète honnêtement "pas encore suivi à
// cette date" plutôt que d'inventer une valeur).

export interface DatedValue {
  date: string; // ISO yyyy-MM-dd
  value: number;
}

export interface ConsolidatedPoint {
  date: string;
  poker: number;
  bourse: number;
  crypto: number;
  total: number;
}

function carryForward(points: DatedValue[], dates: string[]): number[] {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const result: number[] = [];
  let idx = 0;
  let current = 0;
  for (const d of dates) {
    while (idx < sorted.length && sorted[idx].date <= d) {
      current = sorted[idx].value;
      idx++;
    }
    result.push(current);
  }
  return result;
}

/**
 * `todayPoint` ancre le dernier point du graphique sur le total "en direct"
 * déjà affiché au-dessus (qui utilise les cours crypto du jour, pas le
 * dernier instantané figé) -- pour que la courbe et le gros chiffre du haut
 * de page ne racontent jamais deux histoires différentes.
 *
 * `fromDate`, si fourni, tronque l'affichage à partir de cette date (ex:
 * masquer un historique trop ancien jugé plus pertinent). La date est tout
 * de même ajoutée à la liste des dates avant le calcul du report de valeur,
 * pour que le tout premier point affiché parte d'un total déjà correctement
 * reporté (poker/bourse/crypto) plutôt que de sauter sur la première entrée
 * réelle après cette date.
 */
export function buildConsolidatedSeries(
  pokerPoints: DatedValue[],
  boursePoints: DatedValue[],
  cryptoPoints: DatedValue[],
  todayPoint: DatedValue,
  fromDate?: string
): ConsolidatedPoint[] {
  const dateSet = new Set<string>();
  for (const p of pokerPoints) dateSet.add(p.date);
  for (const p of boursePoints) dateSet.add(p.date);
  for (const p of cryptoPoints) dateSet.add(p.date);
  dateSet.add(todayPoint.date);
  if (fromDate) dateSet.add(fromDate);

  const dates = [...dateSet].sort((a, b) => a.localeCompare(b));

  const pokerSeries = carryForward(pokerPoints, dates);
  const bourseSeries = carryForward(boursePoints, dates);
  const cryptoSeries = carryForward(cryptoPoints, dates);

  const points: ConsolidatedPoint[] = dates.map((date, i) => ({
    date,
    poker: pokerSeries[i],
    bourse: bourseSeries[i],
    crypto: cryptoSeries[i],
    total: pokerSeries[i] + bourseSeries[i] + cryptoSeries[i],
  }));

  const last = points[points.length - 1];
  if (last && last.date === todayPoint.date) {
    last.total = todayPoint.value;
  }

  return fromDate ? points.filter((p) => p.date >= fromDate) : points;
}
