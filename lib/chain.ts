import { defineChain } from "viem";
export const robinhoodTestnet = defineChain({
  id: 46630, name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.chain.robinhood.com"] } },
  blockExplorers: { default: { name: "Explorer", url: "https://explorer.testnet.chain.robinhood.com" } },
});
export const EXPLORER = "https://explorer.testnet.chain.robinhood.com";
export const short = (a: string) => `${a.slice(0, 5)}...${a.slice(-4)}`;
