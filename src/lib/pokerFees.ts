// Frais ponctuels prélevés sur la bankroll pour des dépenses liées au poker
// mais pas au jeu lui-même (matériel, formation, frais de tournois live...).
// Pas de formulaire pour ça : Dimitri communique montant / libellé / date au
// fil de l'eau et on les ajoute ici à la main.
//
// Chaque frais s'applique à partir de sa `date` et reste comptabilisé pour
// toutes les sessions suivantes (cumulatif) -- ajouter un nouveau frais fait
// donc automatiquement grandir le cumul affiché sur les tickets à venir,
// sans toucher aux tickets déjà passés avant sa date.

export interface PokerFee {
  date: string; // ISO yyyy-MM-dd -- date de la session à partir de laquelle ce frais s'applique
  label: string;
  amount: number;
}

export const POKER_FEES: PokerFee[] = [
  // Formation déjà retirée de la bankroll avant le ticket du 11/10 -- datée
  // du ticket du 02/10, le plus proche de ce retrait réel.
  { date: "2026-10-02", label: "Formation poker", amount: 250 },
  // Idem pour le tournoi live, déjà retiré avant le 11/10.
  { date: "2026-09-29", label: "Frais de tournoi live", amount: 250 },
  { date: "2026-10-11", label: "Achat d'un MacBook", amount: 400 },
  { date: "2026-10-15", label: "Achat souris + câble de charge", amount: 60 },
  // Frais familiaux : plusieurs versements sous le même libellé, regroupés
  // sur une seule ligne dans le récap de la page Bankroll (chacun garde sa
  // date pour le cumul par session).
  { date: "2026-10-26", label: "Argent pour la famille ❤️", amount: 200 },
  { date: "2026-11-03", label: "Argent pour la famille ❤️", amount: 270 },
  { date: "2026-11-13", label: "Argent pour la famille ❤️", amount: 200 },
  { date: "2026-11-06", label: "Anniversaire de mon chaton ❤️", amount: 500 },
];

export interface CumulativeFees {
  total: number;
  items: PokerFee[];
}

/**
 * Cumul de tous les frais dont la date est <= à `date` -- triés du plus
 * ancien au plus récent pour un affichage lisible dans le détail.
 */
export function cumulativeFeesAsOf(date: string): CumulativeFees {
  const items = [...POKER_FEES]
    .filter((f) => f.date <= date)
    .sort((a, b) => a.date.localeCompare(b.date));
  const total = items.reduce((sum, f) => sum + f.amount, 0);
  return { total, items };
}
