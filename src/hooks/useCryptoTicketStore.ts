"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CryptoTicket } from "@/types";

export function useCryptoTicketStore() {
  const [tickets, setTickets] = useState<CryptoTicket[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const q = query(collection(db, "crypto_tickets"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as CryptoTicket[];
      setTickets(data);
    } catch (err) {
      console.error("useCryptoTicketStore: échec du chargement des tickets crypto", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return { tickets, loaded };
}
