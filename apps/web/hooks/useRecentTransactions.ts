"use client";

import { useEffect, useState } from "react";
import type { TxEntry } from "@/components/transaction-list";

const STORAGE_KEY = "recent-transactions";

export function useRecentTransactions() {
  const [items, setItems] = useState<TxEntry[]>([]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addTx = (tx: TxEntry) => setItems((prev) => [tx, ...prev].slice(0, 8));
  const updateTx = (hash: string, status: TxEntry["status"]) =>
    setItems((prev) => prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx)));

  return { items, addTx, updateTx };
}
