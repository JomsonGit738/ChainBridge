# Web3 dApp POC — Wallet Connect + Contract Read/Write + GraphQL Feed

A turnkey monorepo showcasing wallet connection, Hardhat smart contract reads/writes, live events, a recent transaction list, and a GraphQL/indexer-style feed. Built with **Next.js (App Router) + TypeScript**, **RainbowKit + wagmi + viem**, **Tailwind + shadcn-style components**, and **Hardhat**.

## Requirements
- Node 18+ and `pnpm`
- MetaMask (or any EIP-1193 wallet)
- No external RPC keys needed for local Hardhat.

## Quickstart

```bash
pnpm install                     # install all workspaces
pnpm chain                       # terminal 1: start Hardhat node (localhost:8545, chainId 31337)
pnpm deploy                      # terminal 2: deploy Counter + write apps/web/src/contracts/Counter.json
pnpm dev                         # terminal 3: start Next.js web app
```

Then open http://localhost:3000 and connect your wallet to **Localhost 8545 (chainId 31337)** in MetaMask.

## Optional: Sepolia + WalletConnect + GraphQL
1) Copy environment template:
```bash
cp apps/web/.env.example apps/web/.env.local
```
2) Fill in any of:
- `NEXT_PUBLIC_SEPOLIA_RPC_URL` — custom Sepolia RPC (optional)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — for WalletConnect (optional; MetaMask works without it)
- `NEXT_PUBLIC_GRAPHQL_ENDPOINT` — point to a subgraph/indexer for the Activity Feed

3) For Sepolia deployments, add secrets in `packages/contracts/.env` (see template) and run:
```bash
pnpm --filter contracts deploy:sepolia
```

## Scripts (root)
- `pnpm dev` – run the Next.js app
- `pnpm build` – build the Next.js app
- `pnpm lint` – lint the Next.js app
- `pnpm chain` – start Hardhat node
- `pnpm deploy` – deploy Counter + write frontend artifact

## What’s inside
- `apps/web` – Next.js App Router UI with RainbowKit connect, contract read/write, transaction lifecycle UI, events panel, and a GraphQL activity feed (with demo mode).
- `packages/contracts` – Hardhat (TypeScript) Counter contract, deploy script writes `apps/web/src/contracts/Counter.json` containing `{ address, abi, chainId }`.

## UX highlights
- RainbowKit Connect button in the navbar with chain badge + connection state
- Contract card: live number read, setNumber + increment, lifecycle status (Awaiting signature → Pending → Confirmed/Failed), tx hash copy, and errors surfaced
- Recent Transactions list persisted to `localStorage`
- Events panel streaming `NumberChanged` logs
- Activity Feed with search, refresh, skeletons, empty/error/demo states, and debug details
- Tailwind + shadcn-style cards/badges/buttons/toasts

## Notes
- If `apps/web/src/contracts/Counter.json` shows the zero address, run `pnpm deploy`.
- Local mode defaults to Hardhat RPC `http://127.0.0.1:8545` (no API keys).
- GraphQL page falls back to demo data when `NEXT_PUBLIC_GRAPHQL_ENDPOINT` is unset.

## Troubleshooting
- Wrong network: click “Switch Network” in the navbar to hop to Hardhat (31337).
- RPC issues: ensure Hardhat node is running or provide a valid Sepolia RPC URL.
- GraphQL schema mismatch: update the query in `apps/web/lib/graphql.ts` to match your subgraph; the UI will show raw errors in the debug section.
