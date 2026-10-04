"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { config } from "@/lib/wagmi";
export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return <WagmiProvider config={config}><QueryClientProvider client={qc}>
    <RainbowKitProvider theme={darkTheme({ accentColor: "#dff902", accentColorForeground: "#15131F", borderRadius: "large" })}>{children}</RainbowKitProvider>
  </QueryClientProvider></WagmiProvider>;
}
