"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BourseTicket } from "@/types";

export function useBourseTicketStore() {
  const [tickets, setTickets] = useState<BourseTicket[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchTickets = useCallback(async () => {
    const q = query(collection(db, "bourse_tickets"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as BourseTicket[];
    setTickets(data);
    setLoaded(true);
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return { tickets, loaded };
}
