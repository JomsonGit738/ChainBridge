"use client";

import { useEffect, useState } from "react";
import { useContractEvent, usePublicClient } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { formatHash, shortenAddress } from "@/lib/utils";

type Props = {
  address: `0x${string}`;
  abi: any;
  chainId: number;
  enabled: boolean;
};

type EventRow = {
  txHash: string;
  caller: string;
  newNumber: string;
};

export function EventsPanel({ address, abi, chainId, enabled }: Props) {
  const publicClient = usePublicClient({ chainId });
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    if (!enabled || !publicClient) return;
    (async () => {
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > 5000n ? currentBlock - 5000n : 0n;
      const logs = await publicClient.getLogs({
        address,
        abi,
        eventName: "NumberChanged",
        fromBlock
      });
      const latest = logs
        .map((log) => ({
          txHash: log.transactionHash,
          caller: (log.args?.caller as string) ?? "",
          newNumber: ((log.args?.newNumber as bigint) ?? 0n).toString()
        }))
        .reverse()
        .slice(0, 8);
      setEvents(latest);
    })();
  }, [enabled, publicClient, address, abi]);

  useContractEvent({
    address,
    abi,
    eventName: "NumberChanged",
    chainId,
    listener(logs) {
      const mapped = logs.map((log) => ({
        txHash: log.transactionHash,
        caller: (log.args?.caller as string) ?? "",
        newNumber: ((log.args?.newNumber as bigint) ?? 0n).toString()
      }));
      setEvents((prev) => {
        const merged = [...mapped.reverse(), ...prev];
        const unique = merged.filter((item, idx) => merged.findIndex((x) => x.txHash === item.txHash) === idx);
        return unique.slice(0, 8);
      });
    },
    enabled
  });

  return (
    <Card className="card-surface">
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>NumberChanged logs (latest first)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!enabled ? (
          <p className="text-sm text-slate-300">Connect to the correct chain and ensure the contract is deployed.</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-slate-300">No events yet. Trigger setNumber or increment.</p>
        ) : (
          <div className="space-y-2">
            {events.map((evt) => (
              <div
                key={evt.txHash}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-semibold text-indigo-100">New number: {evt.newNumber}</div>
                  <div className="text-slate-300">Caller: {shortenAddress(evt.caller)}</div>
                </div>
                <Badge variant="outline">{formatHash(evt.txHash)}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
