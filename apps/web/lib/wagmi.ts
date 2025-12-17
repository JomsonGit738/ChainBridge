import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { createConfig, configureChains } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";

const hardhatRpc = process.env.NEXT_PUBLIC_HARDHAT_RPC_URL || "http://127.0.0.1:8545";
const sepoliaRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [hardhat, sepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === hardhat.id) return { http: hardhatRpc };
        if (chain.id === sepolia.id && sepoliaRpc) return { http: sepoliaRpc };
        return null;
      }
    }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Web3 dApp POC",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains
});

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
});

export { chains };
