"use client";

import { formatHash, formatTimestamp } from "@/lib/utils";
import { Badge } from "./ui/badge";

export type TxEntry = {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  label?: string;
  timestamp: number;
};

type Props = {
  transactions: TxEntry[];
  onCopy?: (hash: string) => void;
};

export default function TransactionList({ transactions, onCopy }: Props) {
  if (!transactions.length) {
    return <p className="text-sm text-slate-300">No transactions yet. Interact with the contract to populate this list.</p>;
  }
  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.hash}
          className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-100">{tx.label || "Tx"}</span>
              <Badge
                variant="outline"
                className={
                  tx.status === "confirmed"
                    ? "border-emerald-400/50 text-emerald-100"
                    : tx.status === "failed"
                    ? "border-rose-400/50 text-rose-100"
                    : "border-amber-300/50 text-amber-100"
                }
              >
                {tx.status}
              </Badge>
            </div>
            <div className="text-xs text-slate-300">{formatTimestamp(tx.timestamp)}</div>
            <button
              className="text-xs text-indigo-200 underline-offset-2 hover:underline"
              onClick={() => onCopy?.(tx.hash)}
            >
              {formatHash(tx.hash)}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
