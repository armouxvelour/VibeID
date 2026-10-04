import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { robinhoodTestnet } from "./chain";
export const config = getDefaultConfig({
  appName: "VibeID",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "missing-project-id",
  chains: [robinhoodTestnet],
  transports: { [robinhoodTestnet.id]: http("https://rpc.testnet.chain.robinhood.com") },
  ssr: true,
});
