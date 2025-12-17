"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { shortenAddress } from "@/lib/utils";
import { Zap } from "lucide-react";

export function Navbar() {
  const { disconnect } = useDisconnect();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm text-slate-300">Web3 dApp POC</div>
            <div className="text-base font-semibold">Wallet + Contract + GraphQL</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div
                  className="flex items-center gap-2"
                  aria-hidden={!ready}
                  style={{ opacity: ready ? 1 : 0, pointerEvents: ready ? "auto" : "none" }}
                >
                  {connected ? (
                    <>
                      <Button variant="outline" size="sm" onClick={openChainModal}>
                        {chain?.name ?? "Chain"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={openAccountModal}>
                        {shortenAddress(account?.address || "") || "Account"}
                      </Button>
                      <Badge variant="outline">{account?.displayBalance ?? "—"}</Badge>
                      <Button variant="destructive" size="sm" onClick={() => disconnect()}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button variant="default" onClick={openConnectModal} disabled={!ready}>
                      Connect Wallet
                    </Button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
