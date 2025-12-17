"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Abi } from "viem";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useSwitchNetwork,
  useWaitForTransaction
} from "wagmi";
import { hardhat } from "wagmi/chains";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EventsPanel } from "@/components/events-panel";
import TransactionList from "@/components/transaction-list";
import { useToast } from "@/hooks/use-toast";
import { useRecentTransactions } from "@/hooks/useRecentTransactions";
import counterArtifact from "@/src/contracts/Counter.json";
import { formatHash, shortenAddress } from "@/lib/utils";
import { Copy, ExternalLink, Loader2, RefreshCcw } from "lucide-react";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const COUNTER_ABI = counterArtifact.abi as Abi;
const COUNTER_ADDRESS = counterArtifact.address as `0x${string}`;
const COUNTER_CHAIN_ID = counterArtifact.chainId ?? hardhat.id;

export default function Home() {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork, isLoading: isSwitching } = useSwitchNetwork();
  const { toast } = useToast();
  const { items: recentTxs, addTx, updateTx } = useRecentTransactions();

  const [inputValue, setInputValue] = useState<string>("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [lastAction, setLastAction] = useState<"setNumber" | "increment">("setNumber");
  const [mounted, setMounted] = useState(false);
  const [handledHash, setHandledHash] = useState<`0x${string}` | undefined>(undefined);

  const isDeployed = COUNTER_ADDRESS !== ZERO_ADDRESS;
  const onCorrectChain = mounted && chain?.id === COUNTER_CHAIN_ID;

  useEffect(() => setMounted(true), []);

  const {
    data: currentNumber,
    isFetching: isReading,
    error: readError,
    refetch
  } = useContractRead({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    functionName: "number",
    chainId: COUNTER_CHAIN_ID,
    enabled: isDeployed,
    watch: true
  });

  const setNumberWrite = useContractWrite({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    functionName: "setNumber",
    chainId: COUNTER_CHAIN_ID
  });
  const incrementWrite = useContractWrite({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    functionName: "increment",
    chainId: COUNTER_CHAIN_ID
  });
  const isWriting = setNumberWrite.isLoading || incrementWrite.isLoading;
  const writeError = setNumberWrite.error || incrementWrite.error;

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isTxError,
    error: txError
  } = useWaitForTransaction({
    hash: txHash,
    chainId: COUNTER_CHAIN_ID
  });

  useEffect(() => {
    if (!txHash) return;
    if (handledHash === txHash && (isConfirmed || isTxError)) return;
    if (isConfirming) {
      updateTx(txHash, "pending");
    } else if (isConfirmed) {
      setHandledHash(txHash);
      updateTx(txHash, "confirmed");
      toast({ title: "Transaction confirmed", description: "State updated on-chain." });
      refetch();
    } else if (isTxError && txError) {
      setHandledHash(txHash);
      updateTx(txHash, "failed");
      toast({
        variant: "destructive",
        title: "Transaction failed",
        description: (txError as any)?.shortMessage || txError.message
      });
    }
  }, [isConfirming, isConfirmed, isTxError, txHash, txError, refetch, toast, updateTx, handledHash]);

  const numberDisplay = useMemo(() => {
    if (!isDeployed) return "Not deployed yet";
    if (readError) return "Unavailable";
    if (typeof currentNumber === "bigint") return currentNumber.toString();
    return currentNumber ? String(currentNumber) : "-";
  }, [currentNumber, isDeployed, readError]);

  const handleWrite = async (action: "setNumber" | "increment") => {
    if (!isDeployed) {
      toast({
        variant: "destructive",
        title: "Contract not deployed",
        description: "Run `pnpm deploy` to write Counter.json."
      });
      return;
    }
    if (!onCorrectChain && switchNetwork) {
      switchNetwork(COUNTER_CHAIN_ID);
      return;
    }
    try {
      setLastAction(action);
      const writer = action === "setNumber" ? setNumberWrite : incrementWrite;
      const tx = await writer.writeAsync({
        args: action === "setNumber" ? [BigInt(inputValue || 0)] : undefined
      });
      const hash = ((tx as any).hash ?? tx) as `0x${string}`;
      setTxHash(hash);
      addTx({
        hash,
        status: "pending",
        label: action === "setNumber" ? `Set to ${inputValue || 0}` : "Increment",
        timestamp: Date.now()
      });
      toast({ title: "Awaiting confirmation", description: "Transaction submitted to the network." });
    } catch (err: any) {
      const message = err?.shortMessage || err?.message || "Transaction rejected";
      toast({ variant: "destructive", title: "Write failed", description: message });
    }
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: `${label} copied`, description: value });
  };

  const statusText = () => {
    if (isWriting) return "Awaiting signature";
    if (isConfirming) return "Pending in mempool";
    if (isConfirmed) return "Confirmed";
    if (isTxError) return "Failed";
    return "Idle";
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 shadow-card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <Badge variant="outline" className="border-indigo-400/50 text-indigo-200">
              Web3 dApp POC
            </Badge>
            <h1 className="text-3xl font-semibold text-white">Counter Playground</h1>
            <p className="text-sm text-slate-300">
              Read / write a local Hardhat contract, monitor events, and explore the GraphQL Activity Feed.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-full bg-white/5 px-3 py-1">
                Chain: {!mounted ? "Detecting…" : onCorrectChain ? chain?.name || "Hardhat" : "Wrong network"}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1">
                Contract: {isDeployed ? formatHash(COUNTER_ADDRESS) : "Deploy required"}
              </span>
              {address && (
                <button
                  className="flex items-center gap-1 text-indigo-200 hover:text-indigo-50"
                  onClick={() => copyToClipboard(address, "Address")}
                >
                  <Copy size={14} /> {shortenAddress(address)}
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" className="bg-indigo-600 text-white hover:bg-indigo-500">
              <Link href="/activity" className="flex items-center">
                Activity Feed <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {!onCorrectChain && switchNetwork && (
              <Button variant="outline" disabled={isSwitching} onClick={() => switchNetwork(COUNTER_CHAIN_ID)}>
                {isSwitching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Switch Network"}
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Number</span>
                <Button variant="ghost" size="icon" disabled={isReading} onClick={() => refetch()} title="Refresh">
                  {isReading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                </Button>
              </CardTitle>
              <CardDescription>Live on-chain value from your Counter contract.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDeployed ? (
                <div className="text-5xl font-semibold text-indigo-100">
                  {isReading ? <Skeleton className="h-12 w-32" /> : numberDisplay}
                </div>
              ) : (
                <p className="text-sm text-amber-200">
                  Deploy first: run <code>pnpm deploy</code>
                </p>
              )}
              {readError && (
                <p className="text-sm text-rose-300">
                  Read failed: {(readError as any)?.shortMessage || (readError as any)?.message}. Ensure RPC is reachable.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="card-surface">
            <CardHeader>
              <CardTitle>Update Number</CardTitle>
              <CardDescription>Set a custom value or increment by one. Transactions show full lifecycle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  type="number"
                  min="0"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter a new number"
                  className="bg-white/5"
                />
                <div className="flex gap-2">
                  <Button disabled={isWriting || isConfirming} onClick={() => handleWrite("setNumber")}>
                    {isWriting && lastAction === "setNumber" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Set Number
                  </Button>
                  <Button variant="outline" disabled={isWriting || isConfirming} onClick={() => handleWrite("increment")}>
                    {isWriting && lastAction === "increment" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Increment
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-indigo-400/50 text-indigo-100">
                    Status: {statusText()}
                  </Badge>
                  {txHash && (
                    <button
                      className="flex items-center gap-1 text-indigo-200 hover:text-indigo-50"
                      onClick={() => copyToClipboard(txHash, "Tx hash")}
                    >
                      <Copy size={14} /> {formatHash(txHash)}
                    </button>
                  )}
                </div>
                {writeError && (
                  <p className="text-rose-300">Write error: {(writeError as any)?.shortMessage || writeError.message}</p>
                )}
                {isTxError && txError && (
                  <p className="text-rose-300">Receipt error: {(txError as any)?.shortMessage || txError.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="text-xs text-slate-400">
              Awaiting signature -> Pending -> Confirmed/Failed. A copy of the tx hash is available once submitted.
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Saved locally in your browser.</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={recentTxs} onCopy={(hash) => copyToClipboard(hash, "Tx hash")} />
            </CardContent>
          </Card>
          <EventsPanel
            address={COUNTER_ADDRESS}
            abi={COUNTER_ABI}
            chainId={COUNTER_CHAIN_ID}
            enabled={isDeployed && onCorrectChain}
          />
        </div>
      </section>
    </div>
  );
}
