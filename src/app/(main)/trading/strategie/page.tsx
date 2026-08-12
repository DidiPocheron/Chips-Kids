"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Stratégie de trading — check-list avant chaque entrée en position.
 *
 * Deux graphiques illustratifs (2H = biais directionnel, 5min = timing d'entrée)
 * avec des badges numérotés survolables/cliquables affichant le point de la
 * check-list à vérifier avant d'entrer en position.
 *
 * Couleurs alignées sur le thème du site (variables CSS globales) — vert sauge
 * pour les hausses, terracotta pour les baisses, bleu comme accent (même teinte
 * que la section Bourse).
 */

// ---------------------------------------------------------------------------
// Thème — aligné sur les tokens du site (globals.css)
// ---------------------------------------------------------------------------
const THEME = {
  panel: "var(--card)",
  panelBorder: "var(--border)",
  textPrimary: "var(--foreground)",
  textSecondary: "var(--muted-foreground)",
  textMuted: "var(--muted-foreground)",
  bg: "var(--background)",
  accent: "#60a5fa", // bleu — même teinte que la section Bourse
  accentSoft: "rgba(96, 165, 250, 0.14)",
  bull: "var(--primary)", // vert sauge — hausse
  bear: "var(--destructive)", // terracotta — baisse
  gridLine: "var(--border)",
};

// ---------------------------------------------------------------------------
// Données illustratives des chandeliers (purement visuelles, pas de vraies données)
// ---------------------------------------------------------------------------
type Candle = { x: number; top: number; bottom: number; wickTop: number; wickBottom: number; bull: boolean; highlight?: boolean };

// Chaque graphique s'arrête sur la bougie d'entrée (encadrée en bleu) — pas de
// bougies "futures" après le signal, pour ne pas biaiser la lecture avec du
// recul qu'on n'a pas au moment du trade. Les positions x sont réétalées sur
// toute la largeur (40 → 600) une fois les bougies après l'entrée retirées.
const candles2h: Candle[] = [
  { x: 40, top: 96, bottom: 124, wickTop: 88, wickBottom: 132, bull: false },
  { x: 96, top: 108, bottom: 134, wickTop: 100, wickBottom: 142, bull: false },
  { x: 152, top: 116, bottom: 146, wickTop: 108, wickBottom: 154, bull: false },
  { x: 208, top: 106, bottom: 134, wickTop: 98, wickBottom: 142, bull: false },
  { x: 264, top: 114, bottom: 140, wickTop: 106, wickBottom: 148, bull: false },
  { x: 320, top: 104, bottom: 132, wickTop: 96, wickBottom: 140, bull: false },
  { x: 376, top: 98, bottom: 124, wickTop: 90, wickBottom: 130, bull: false },
  { x: 432, top: 92, bottom: 116, wickTop: 84, wickBottom: 122, bull: false },
  { x: 488, top: 82, bottom: 104, wickTop: 74, wickBottom: 110, bull: false },
  { x: 544, top: 66, bottom: 88, wickTop: 58, wickBottom: 96, bull: true }, // bougie de cassure (1/2)
  { x: 600, top: 48, bottom: 72, wickTop: 40, wickBottom: 80, bull: true, highlight: true }, // entrée — 2e clôture consécutive
];

const candles5min: Candle[] = [
  { x: 40, top: 60, bottom: 84, wickTop: 52, wickBottom: 92, bull: false },
  { x: 96, top: 68, bottom: 96, wickTop: 60, wickBottom: 104, bull: false },
  { x: 152, top: 78, bottom: 108, wickTop: 70, wickBottom: 116, bull: false },
  { x: 208, top: 70, bottom: 96, wickTop: 62, wickBottom: 104, bull: false },
  { x: 264, top: 34, bottom: 62, wickTop: 26, wickBottom: 70, bull: true },
  { x: 320, top: 10, bottom: 38, wickTop: 2, wickBottom: 46, bull: true },
  { x: 376, top: 0, bottom: 22, wickTop: -6, wickBottom: 30, bull: true },
  { x: 432, top: 8, bottom: 30, wickTop: 0, wickBottom: 38, bull: false },
  { x: 488, top: 12, bottom: 34, wickTop: 4, wickBottom: 42, bull: false },
  { x: 544, top: 6, bottom: 26, wickTop: -2, wickBottom: 34, bull: false }, // touche la zone de survente
  { x: 600, top: -10, bottom: 12, wickTop: -18, wickBottom: 20, bull: true, highlight: true }, // entrée — retournement
];

// ---------------------------------------------------------------------------
// Points de la checklist (position en % dans chaque carte de graphique)
// ---------------------------------------------------------------------------
type Point = {
  id: number;
  x: number;
  y: number;
  title: string;
  description: string;
  /** Sur quel graphique afficher le badge — le graphique principal par défaut. */
  on?: "main" | "stoch" | "volume";
};

const points2h: Point[] = [
  { id: 1, x: 90, y: 36, title: "Bougie clôturée", description: "La dernière bougie 2h CLÔTURÉE (pas celle en cours) est du bon côté de la VWMA(50)." },
  { id: 2, x: 84, y: 50, title: "Corps franc", description: "Un vrai corps de bougie, pas un doji collé à la ligne — signal plus fiable." },
  { id: 3, x: 76, y: 46, title: "VWMA orientée", description: "La VWMA(50) elle-même s'oriente dans le sens du biais, pas juste retestée en configuration plate." },
  { id: 4, x: 89, y: 26, title: "2 bougies consécutives", description: "Idéalement au moins 2 clôtures consécutives du même côté — une seule peut être un aller-retour sans lendemain. Ici : entrée dès la 2e, pas d'attente inutile." },
  { id: 5, x: 42, y: 55, on: "stoch", title: "Stoch pas extrême", description: "Le Stochastique 2h n'est pas déjà en zone extrême au moment du croisement — un simple garde-fou, pas un déclencheur." },
  { id: 6, x: 90, y: 20, on: "volume", title: "Volume > SMA(20)", description: "Le volume de la bougie de cassure dépasse sa moyenne mobile 20 — confirme la conviction derrière le mouvement." },
  { id: 7, x: 15, y: 90, title: "Range ou tendance ?", description: "Une cassure de VWMA à l'intérieur d'un range large depuis plusieurs semaines est un signal plus faible qu'après une tendance nette." },
];

const points5min: Point[] = [
  { id: 8, x: 41, y: 30, title: "VWMA(200) alignée", description: "Le prix est du bon côté de la VWMA(200), cohérent avec le biais déterminé sur le 2h." },
  { id: 9, x: 88, y: 78, on: "stoch", title: "Stoch : retournement", description: "Le Stochastique a touché la zone de survente (<20) sur la bougie précédente PUIS se retourne à la hausse ici — c'est ce retournement qui déclenche, pas la zone basse seule." },
  { id: 10, x: 94, y: 20, on: "volume", title: "Pic de volume", description: "Un pic de volume au-dessus de la SMA(20) accompagne cette bougie de retournement, dans le sens du biais 2h." },
];

const riskItems = [
  { title: "Stop technique", description: "Placé sous le niveau testé (VWMA), avec marge sous la mèche si besoin." },
  { title: "Objectif R/R 1:2", description: "Risk/Reward fixe pour garder des statistiques comparables trade après trade." },
  { title: "Taille de position calculée", description: "Risque réel toujours ≤ budget max défini, avec le bon contrat (Micro si besoin)." },
  { title: "Fenêtre horaire", description: "Dans la plage de liquidité favorable à l'actif tradé." },
  { title: "Calendrier macro vérifié", description: "Pas de publication à fort impact imminente ou en cours de digestion." },
  { title: "Pas d'obstacle proche", description: "Aucune résistance/support majeur entre le prix et l'objectif." },
];

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------
function CandleShape({ c }: { c: Candle }) {
  const bodyH = Math.abs(c.bottom - c.top);
  const bodyY = Math.min(c.top, c.bottom);
  const color = c.bull ? THEME.bull : THEME.bear;
  return (
    <g>
      <line x1={c.x} y1={c.wickTop} x2={c.x} y2={c.wickBottom} stroke={color} strokeWidth={2} />
      <rect
        x={c.x - 7}
        y={bodyY}
        width={14}
        height={Math.max(bodyH, 3)}
        fill={color}
        stroke={c.highlight ? THEME.accent : "none"}
        strokeWidth={c.highlight ? 2.5 : 0}
        rx={1.5}
      />
    </g>
  );
}

function Badge({
  point,
  active,
  onEnter,
  onLeave,
  onToggle,
}: {
  point: Point;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onToggle: () => void;
}) {
  return (
    <button
      className={`badge${active ? " badge--active" : ""}`}
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onToggle}
      aria-label={`Point ${point.id} : ${point.title}`}
    >
      {point.id}
      {active && (
        <span className="tooltip" role="tooltip">
          <span className="tooltip-num">{point.id}</span>
          <span className="tooltip-title">{point.title}</span>
          <span className="tooltip-desc">{point.description}</span>
        </span>
      )}
      <style jsx>{`
        .badge {
          position: absolute;
          transform: translate(-50%, -50%);
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: ${THEME.panel};
          border: 2px solid ${THEME.accent};
          color: ${THEME.accent};
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 0 4px ${THEME.accentSoft};
          z-index: 2;
        }
        .badge:hover,
        .badge--active {
          background: ${THEME.accent};
          color: #fff;
          transform: translate(-50%, -50%) scale(1.15);
          box-shadow: 0 0 0 6px ${THEME.accentSoft}, 0 0 18px ${THEME.accentSoft};
        }
        .tooltip {
          position: absolute;
          bottom: calc(100% + 14px);
          left: 50%;
          transform: translateX(-50%);
          width: 240px;
          background: ${THEME.panel};
          border: 1px solid ${THEME.panelBorder};
          border-radius: 12px;
          padding: 12px 14px;
          text-align: left;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
          animation: pop 0.15s ease-out;
          z-index: 10;
        }
        .tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-top-color: ${THEME.panel};
        }
        .tooltip-num {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: ${THEME.accent};
          margin-bottom: 4px;
        }
        .tooltip-title {
          display: block;
          font-family: var(--font-fraunces);
          font-size: 14px;
          font-weight: 700;
          color: ${THEME.textPrimary};
          margin-bottom: 4px;
        }
        .tooltip-desc {
          display: block;
          font-size: 12.5px;
          line-height: 1.45;
          color: ${THEME.textSecondary};
          font-weight: 400;
        }
        @keyframes pop {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </button>
  );
}

function ChartPanel({
  label,
  subtitle,
  candles,
  points,
  activeId,
  setActiveId,
  vwmaLabel,
  stochPath,
  volumeBars,
}: {
  label: string;
  subtitle: string;
  candles: Candle[];
  points: Point[];
  activeId: number | null;
  setActiveId: (id: number | null) => void;
  vwmaLabel: string;
  stochPath: string;
  volumeBars: { x: number; h: number; highlight?: boolean }[];
}) {
  const minTop = Math.min(...candles.map((c) => c.wickTop));
  const maxBottom = Math.max(...candles.map((c) => c.wickBottom));
  const vwmaY = (minTop + maxBottom) / 2 + 10;

  const mainPoints = points.filter((p) => !p.on || p.on === "main");
  const stochPoints = points.filter((p) => p.on === "stoch");
  const volumePoints = points.filter((p) => p.on === "volume");

  return (
    <Card className="mb-6 overflow-visible">
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="chart-wrap">
          <span className="vwma-badge">{vwmaLabel}</span>
          <svg viewBox={`0 -60 640 ${maxBottom + 90}`} preserveAspectRatio="none" className="chart-svg">
            <path
              d={`M0,${vwmaY} C160,${vwmaY - 10} 320,${vwmaY + 6} 480,${vwmaY - 20} S 640,${vwmaY - 40} 640,${vwmaY - 45}`}
              fill="none"
              stroke={THEME.textSecondary}
              strokeWidth={2}
              opacity={0.8}
            />
            {candles.map((c, i) => (
              <CandleShape key={i} c={c} />
            ))}
          </svg>

          {mainPoints.map((p) => (
            <Badge
              key={p.id}
              point={p}
              active={activeId === p.id}
              onEnter={() => setActiveId(p.id)}
              onLeave={() => setActiveId(null)}
              onToggle={() => setActiveId(activeId === p.id ? null : p.id)}
            />
          ))}
        </div>

        <div className="sub-chart">
          <span className="sub-label">
            Stochastique (14,3,5) <em>— seuils 80 (surachat) / 20 (survente)</em>
          </span>
          <div className="sub-chart-wrap sub-chart-wrap--stoch">
            <svg viewBox="0 0 640 100" preserveAspectRatio="none" className="sub-svg">
              <rect x="0" y="0" width="640" height="20" fill={THEME.bear} opacity={0.08} />
              <rect x="0" y="80" width="640" height="20" fill={THEME.bull} opacity={0.08} />

              <line x1="0" y1="20" x2="640" y2="20" stroke={THEME.bear} strokeOpacity={0.5} strokeDasharray="4,4" />
              <text x="6" y="14" fontSize="9" fill={THEME.bear} opacity={0.8}>
                80 — surachat
              </text>

              <line x1="0" y1="50" x2="640" y2="50" stroke={THEME.gridLine} strokeDasharray="3,4" />

              <line x1="0" y1="80" x2="640" y2="80" stroke={THEME.bull} strokeOpacity={0.5} strokeDasharray="4,4" />
              <text x="6" y="96" fontSize="9" fill={THEME.bull} opacity={0.8}>
                20 — survente
              </text>

              <path d={stochPath} fill="none" stroke={THEME.textPrimary} strokeWidth={2.5} />
            </svg>
            {stochPoints.map((p) => (
              <Badge
                key={p.id}
                point={p}
                active={activeId === p.id}
                onEnter={() => setActiveId(p.id)}
                onLeave={() => setActiveId(null)}
                onToggle={() => setActiveId(activeId === p.id ? null : p.id)}
              />
            ))}
          </div>
        </div>

        <div className="sub-chart">
          <span className="sub-label">Volume + SMA(20)</span>
          <div className="sub-chart-wrap sub-chart-wrap--volume">
            <svg viewBox="0 0 640 60" preserveAspectRatio="none" className="sub-svg">
              <line x1="0" y1="34" x2="640" y2="34" stroke={THEME.textMuted} strokeOpacity={0.4} strokeDasharray="2,3" />
              {volumeBars.map((v, i) => (
                <rect
                  key={i}
                  x={v.x - 6}
                  y={60 - v.h}
                  width={12}
                  height={v.h}
                  fill={v.highlight ? THEME.accent : THEME.textMuted}
                  opacity={v.highlight ? 1 : 0.35}
                  rx={1}
                />
              ))}
            </svg>
            {volumePoints.map((p) => (
              <Badge
                key={p.id}
                point={p}
                active={activeId === p.id}
                onEnter={() => setActiveId(p.id)}
                onLeave={() => setActiveId(null)}
                onToggle={() => setActiveId(activeId === p.id ? null : p.id)}
              />
            ))}
          </div>
        </div>

        <ul className="legend">
          {points.map((p) => (
            <li
              key={p.id}
              className={activeId === p.id ? "legend--active" : ""}
              onMouseEnter={() => setActiveId(p.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <span className="legend-num">{p.id}</span>
              {p.title}
            </li>
          ))}
        </ul>
      </CardContent>

      <style jsx>{`
        .chart-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 640 / 260;
        }
        .vwma-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 3;
          font-size: 11px;
          font-weight: 700;
          color: ${THEME.textSecondary};
          background: ${THEME.panel};
          border: 1px solid ${THEME.panelBorder};
          border-radius: 999px;
          padding: 3px 10px;
        }
        .chart-svg {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }
        .sub-chart {
          margin-top: 14px;
          position: relative;
        }
        .sub-label {
          font-size: 11px;
          color: ${THEME.textMuted};
        }
        .sub-label em {
          font-style: normal;
          color: ${THEME.textMuted};
          opacity: 0.7;
        }
        .sub-chart-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 640 / 60;
        }
        .sub-chart-wrap--stoch {
          aspect-ratio: 640 / 100;
        }
        .sub-svg {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }
        .legend {
          list-style: none;
          margin: 20px 0 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .legend li {
          font-size: 12px;
          color: ${THEME.textSecondary};
          background: ${THEME.bg};
          border: 1px solid ${THEME.panelBorder};
          border-radius: 999px;
          padding: 5px 12px 5px 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: default;
          transition: all 0.15s ease;
        }
        .legend--active,
        .legend li:hover {
          border-color: ${THEME.accent};
          color: ${THEME.textPrimary};
        }
        .legend-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: ${THEME.accentSoft};
          color: ${THEME.accent};
          font-size: 10px;
          font-weight: 700;
        }
      `}</style>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function StrategiePage() {
  const [active2h, setActive2h] = useState<number | null>(null);
  const [active5min, setActive5min] = useState<number | null>(null);

  // Stoch 2h : reste en zone médiane (30-70), jamais en zone extrême — cf. point 5.
  // Coupé et réétalé pour s'arrêter exactement sur la bougie d'entrée (x=600).
  const stochPath2h =
    "M0,45 C82,58 164,40 245,52 C327,62 409,45 491,55 C545,50 573,44 600,42";

  // Stoch 5min : touche la zone de survente (x≈545) puis amorce le retournement
  // jusqu'à la bougie d'entrée (x=600) — cf. point 9. Coupé juste après, pas de
  // suite qui montrerait la hausse à venir.
  const stochPath5min =
    "M0,45 C82,52 164,62 232,70 C286,66 341,58 382,50 C423,58 457,70 491,80 C515,85 529,87 545,88 C562,84 578,79 600,75";

  const volumeBars2h = [
    { x: 82, h: 20 }, { x: 164, h: 30 }, { x: 245, h: 22 }, { x: 327, h: 26 },
    { x: 409, h: 34 }, { x: 491, h: 24 }, { x: 573, h: 44, highlight: true },
  ];
  const volumeBars5min = [
    { x: 82, h: 18 }, { x: 164, h: 24 }, { x: 245, h: 20 }, { x: 327, h: 30 },
    { x: 409, h: 22 }, { x: 491, h: 18 }, { x: 545, h: 20 },
    { x: 600, h: 50, highlight: true },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: THEME.accent }}>
          Ma stratégie
        </span>
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Check-list avant chaque entrée en position</h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Deux unités de temps, une logique simple : le graphique 2H donne le biais directionnel,
          le graphique 5min donne le timing d&apos;entrée. Survole (ou touche sur mobile) chaque badge numéroté
          pour voir le point exact à vérifier.
        </p>
      </div>

      <ChartPanel
        label="Graphique 2H — Biais directionnel"
        subtitle="VWMA(50) + Stochastique (14,3,5) + Volume"
        candles={candles2h}
        points={points2h}
        activeId={active2h}
        setActiveId={setActive2h}
        vwmaLabel="VWMA(50)"
        stochPath={stochPath2h}
        volumeBars={volumeBars2h}
      />

      <ChartPanel
        label="Graphique 5min — Timing d'entrée"
        subtitle="VWMA(200) + Stochastique (14,3,5) + Volume"
        candles={candles5min}
        points={points5min}
        activeId={active5min}
        setActiveId={setActive5min}
        vwmaLabel="VWMA(200)"
        stochPath={stochPath5min}
        volumeBars={volumeBars5min}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gestion du risque, filtre horaire &amp; macro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {riskItems.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke={THEME.accent}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <strong className="block text-sm font-semibold text-foreground mb-0.5">{r.title}</strong>
                  <span className="block text-xs leading-relaxed text-muted-foreground">{r.description}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
