# Contracts package

Simple Hardhat (TypeScript) workspace with a Counter contract.

## Commands
- `pnpm --filter contracts hardhat node` — start local chain
- `pnpm --filter contracts compile` — compile
- `pnpm --filter contracts test` — run tests
- `pnpm --filter contracts deploy` — deploy locally and write apps/web/src/contracts/Counter.json
- `pnpm --filter contracts deploy:sepolia` — optional Sepolia deploy (needs .env secrets)
