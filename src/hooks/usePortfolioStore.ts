"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PortfolioEntry } from "@/types";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function usePortfolioStore(collectionName: string) {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchEntries = useCallback(async () => {
    const q = query(collection(db, collectionName), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as PortfolioEntry[];
    setEntries(data);
    setLoaded(true);
  }, [collectionName]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(async (entry: Omit<PortfolioEntry, "id">): Promise<void> => {
    const id = generateId();
    await setDoc(doc(db, collectionName, id), { ...entry, id });
    await fetchEntries();
  }, [collectionName, fetchEntries]);

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    await deleteDoc(doc(db, collectionName, id));
    await fetchEntries();
  }, [collectionName, fetchEntries]);

  const currentAmount = entries.length > 0 ? entries[0].amount : 0;
  const firstAmount = entries.length > 0
    ? [...entries].sort((a, b) => a.date.localeCompare(b.date))[0].amount
    : 0;

  return { entries, addEntry, deleteEntry, currentAmount, firstAmount, loaded };
}
