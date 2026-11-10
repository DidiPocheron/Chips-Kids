"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "bourse-unlocked";

// Version 1 : identifiants en dur, contrôle uniquement côté client.
// Sert de verrou générique pour tout le site (initialement pour la section
// Bourse) : ça masque l'accès
// depuis l'interface (contenu flouté, pages verrouillées) mais ne protège
// pas les données elles-mêmes -- à remplacer par une vraie authentification
// si besoin d'une protection plus sérieuse plus tard.
const APP_LOGIN = "login";
const APP_PASSWORD = "mdp";

export function useAppAuth() {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // localStorage indisponible (navigation privée, etc.) -- on reste verrouillé
    } finally {
      setReady(true);
    }
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const ok = username === APP_LOGIN && password === APP_PASSWORD;
    if (ok) {
      setUnlocked(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // tant pis, l'accès restera déverrouillé seulement pour cette session
      }
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    setUnlocked(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // rien à faire
    }
  }, []);

  return { unlocked, ready, login, logout };
}
