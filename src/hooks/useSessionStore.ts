"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SessionPost, SessionBankroll } from "@/types";

const INITIAL_BANKROLL: SessionBankroll = {
  winamax: 40,
  pokerstars: 0,
  unibet: 0,
  wallet: 460,
  total: 500,
};

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useSessionStore() {
  const [sessions, setSessions] = useState<SessionPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const q = query(collection(db, "sessions"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as SessionPost[];
      setSessions(data);
    } catch (err) {
      console.error("useSessionStore: échec du chargement des sessions", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const addSession = useCallback(async (session: Omit<SessionPost, "id">): Promise<void> => {
    const id = generateId();
    await setDoc(doc(db, "sessions", id), { ...session, id });
    await fetchSessions();
  }, [fetchSessions]);

  const updateSession = useCallback(async (id: string, updates: Partial<Omit<SessionPost, "id">>): Promise<void> => {
    await updateDoc(doc(db, "sessions", id), updates as Record<string, unknown>);
    await fetchSessions();
  }, [fetchSessions]);

  const deleteSession = useCallback(async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "sessions", id));
    await fetchSessions();
  }, [fetchSessions]);

  const currentBankroll: SessionBankroll =
    sessions.length > 0 ? sessions[0].bankroll : INITIAL_BANKROLL;

  return { sessions, addSession, updateSession, deleteSession, currentBankroll, loaded };
}
