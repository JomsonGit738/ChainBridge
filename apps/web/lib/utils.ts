import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatHash(hash?: string) {
  if (!hash) return "";
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

export function formatTimestamp(ts?: string | number | null) {
  if (!ts) return "—";
  const num = typeof ts === "string" ? Number(ts) : ts;
  if (Number.isNaN(num)) return "—";
  return new Date(num * (num > 1e12 ? 1 : 1000)).toLocaleString();
}
