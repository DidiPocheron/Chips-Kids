"use client";

import { Button } from "@/components/ui/button";
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";

export type SortOrder = "desc" | "asc";

interface Props {
  order: SortOrder;
  onChange: (order: SortOrder) => void;
  className?: string;
}

// Petit switch réutilisable pour inverser l'ordre chronologique d'une liste
// de tickets (poker / crypto / bourse) : "desc" = plus récent en premier
// (comportement par défaut existant), "asc" = plus ancien en premier.
export function SortOrderToggle({ order, onChange, className }: Props) {
  const isDesc = order === "desc";
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => onChange(isDesc ? "asc" : "desc")}
      className={className}
    >
      {isDesc ? (
        <ArrowDownNarrowWide className="w-3.5 h-3.5" />
      ) : (
        <ArrowUpNarrowWide className="w-3.5 h-3.5" />
      )}
      {isDesc ? "Plus récent d'abord" : "Plus ancien d'abord"}
    </Button>
  );
}
