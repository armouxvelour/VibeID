"use client";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ProfileView from "@/components/ProfileView";
import { robinhoodTestnet } from "@/lib/chain";
import type { Profile } from "@/lib/types";

export default function Home() {
  const { address, chainId, isConnected } = useAccount();
  const { switchChain, error: swErr } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const [stage, setStage] = useState(0);
  const [p, setP] = useState<Profile | null>(null);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const right = isConnected && chainId === robinhoodTestnet.id;

  const run = async (fresh = false) => {
    if (!address) return; setBusy(true); setErr("");
    try { const r = await fetch(`/api/analyze/${address}${fresh ? "?fresh=1" : ""}`, { signal: AbortSignal.timeout(60000) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); setP(j); }
    catch (e: any) { setErr(e.name === "TimeoutError" ? "Analysis took too long. Try again." : e.message || "Analysis failed. Try again."); } finally { setBusy(false); }
  };
  useEffect(() => { if (right) run(); else setP(null); }, [right, address]);
  useEffect(() => { if (!busy) { setStage(0); return; } const t = setInterval(() => setStage((x) => Math.min(x + 1, 4)), 1500); return () => clearInterval(t); }, [busy]);

  if (right && p) return <ProfileView p={p} owner onRefresh={() => run(true)} onDisconnect={() => disconnect()} refreshing={busy} error={err} />;
  const stages = ["Connecting to wallet", "Fetching activity", "Analyzing contracts", "Mapping your vibe", "Generating profile"];
  const reads = [["Transactions", "Every call and transfer from your wallet"], ["Contracts", "The apps and tokens you've touched"], ["Deployments", "What you've built and launched"], ["Active days", "How consistently you show up"]];
  return <main className="flex min-h-screen flex-col" style={{ backgroundImage: "radial-gradient(rgba(243,238,228,.07) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
    <nav className="flex items-center justify-between px-6 py-5">
      <img src="/logo-full.png" alt="VibeID" className="h-7 w-auto" />
      <div className="inline-flex items-center gap-2 rounded-full border border-accent px-3 py-1 text-xs tracking-wide text-accent">
        <img src="/robinhood.png" alt="Robinhood" className="h-4 w-4 rounded-sm" />TESTNET</div>
    </nav>
    <section className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">What does your wallet say about you?</h1>
      <p className="mt-6 max-w-md text-lg opacity-70">Turn your onchain activity into a profile you can actually understand.</p>
      <div className="mt-10 flex flex-col items-center gap-4">
        <ConnectButton chainStatus="none" showBalance={false} label="Connect Wallet" />
        {isConnected && !right && <button onClick={() => switchChain({ chainId: robinhoodTestnet.id })} className="rounded-full bg-accent px-6 py-3 font-semibold text-ink">Switch to Robinhood Chain Testnet</button>}
        {isConnected && <button onClick={() => disconnect()} className="text-sm underline opacity-70">Disconnect wallet</button>}
      </div>
      {swErr && <p className="mt-4 text-sm text-red-300">Network switch was rejected or failed. Try again.</p>}
      {busy && <ul className="mx-auto mt-8 max-w-xs space-y-1 text-left text-sm">{stages.map((t, i) => <li key={t} className={i <= stage ? "" : "opacity-30"}><span className="inline-block w-5 text-accent">{i < stage ? "✓" : i === stage ? "…" : ""}</span>{t}</li>)}</ul>}
      {err && <p className="mt-6 text-red-300">{err} <button className="underline" onClick={() => run(true)}>Retry</button></p>}
    </section>
    <section className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-8 border-t border-paper/10 px-6 py-10 text-left sm:grid-cols-4">
      {reads.map(([t, d]) => <div key={t}><div className="font-semibold text-accent">{t}</div><div className="mt-1 text-sm opacity-60">{d}</div></div>)}
    </section>
  </main>;
}
