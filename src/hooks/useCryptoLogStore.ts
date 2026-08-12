"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CryptoLogEntry } from "@/types";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useCryptoLogStore() {
  const [entries, setEntries] = useState<CryptoLogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const q = query(collection(db, "crypto_logbook"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as CryptoLogEntry[];
      setEntries(data);
    } catch (err) {
      console.error("useCryptoLogStore: échec du chargement du carnet crypto", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const addEntry = useCallback(async (entry: Omit<CryptoLogEntry, "id">): Promise<void> => {
    const id = generateId();
    await setDoc(doc(db, "crypto_logbook", id), { ...entry, id });
    await fetchEntries();
  }, [fetchEntries]);

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "crypto_logbook", id));
    await fetchEntries();
  }, [fetchEntries]);

  return { entries, addEntry, deleteEntry, loaded };
}
