import type { SessionRating } from "@/types";

export const RATING_CONFIG: Record<SessionRating, {
  src: string;
  label: string;
  accent: string;
  color: string;
}> = {
  excellent:      { src: "/ratings/excellent.png",      label: "Excellente",     accent: "border-l-green-400",        color: "text-green-600" },
  good:           { src: "/ratings/good.png",           label: "Bonne",          accent: "border-l-blue-400",         color: "text-blue-500" },
  ras:            { src: "/ratings/RAS.png",            label: "RAS",            accent: "border-l-muted-foreground", color: "text-muted-foreground" },
  "not-good":     { src: "/ratings/not-good.png",       label: "Mauvaise",       accent: "border-l-orange-400",       color: "text-orange-500" },
  catastrophique: { src: "/ratings/catastrophique.png", label: "Catastrophique", accent: "border-l-destructive",      color: "text-destructive" },
};

export const RATING_OPTIONS: { value: SessionRating; label: string }[] = [
  { value: "excellent",      label: "Excellente" },
  { value: "good",           label: "Bonne" },
  { value: "ras",            label: "RAS" },
  { value: "not-good",       label: "Mauvaise" },
  { value: "catastrophique", label: "Catastrophique" },
];
