"use client";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { Profile } from "@/lib/types";
import { EXPLORER, short } from "@/lib/chain";
const CONTRACT = process.env.NEXT_PUBLIC_ACHIEVEMENT_CONTRACT_ADDRESS as `0x${string}` | undefined;
const abi = [{ name: "claimAchievement", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] }] as const;

function Claim({ id, canClaim }: { id: number; canClaim: boolean }) {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const done = useWaitForTransactionReceipt({ hash });
  if (!CONTRACT || !canClaim) return null;
  if (done.isSuccess) return <a className="text-accent text-sm" href={`${EXPLORER}/tx/${hash}`} target="_blank">Claimed. View transaction ↗</a>;
  return <div>
    <button disabled={isPending || !!hash} onClick={() => writeContract({ address: CONTRACT, abi, functionName: "claimAchievement", args: [BigInt(id)] })} className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-ink disabled:opacity-50">{isPending || hash ? "Confirming..." : "Claim onchain"}</button>
    {error && <p className="mt-1 text-xs text-red-300">The achievement couldn&apos;t be claimed. Check that your wallet has testnet ETH for gas and try again.</p>}
  </div>;
}

export default function ProfileView({ p, onRefresh, owner, onDisconnect, refreshing, error }: { refreshing?: boolean; error?: string; p: Profile; onRefresh?: () => void; owner?: boolean; onDisconnect?: () => void }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${location.origin}/v/${p.address}`;
    try { if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) { await navigator.share({ title: "My VibeID", url }); return; } await navigator.clipboard.writeText(url); }
    catch { const t = document.createElement("textarea"); t.value = url; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const mins = Math.round((Date.now() - p.analyzedAt) / 60000);
  const s = p.stats, max = Math.max(1, ...p.weekly);
  const stat = (v: number, l: string) => <div key={l}><div className="text-3xl font-semibold">{v.toLocaleString()}</div><div className="text-sm opacity-60">{l}</div></div>;
  if (!s.transactions) return <section className="mx-auto max-w-xl py-20 text-center">
    <h2 className="text-3xl font-semibold">Your vibe is just getting started</h2>
    <p className="mt-3 opacity-70">We found 0 transactions on Robinhood Chain Testnet. Make your first testnet transaction to start building your VibeID.</p>
    <p className="mt-6 opacity-60">First transaction → first contract → first achievement → your VibeID</p></section>;
  return <main className="mx-auto max-w-3xl px-5 py-10">
    <header className="flex items-center justify-between text-sm"><img src="/logo-full.png" alt="VibeID" className="h-8 w-auto" /><span className="flex items-center gap-3">{short(p.address)}{onDisconnect && <button onClick={onDisconnect} className="underline opacity-70">Disconnect</button>}</span></header>
    <section className="rise py-14 text-center">
      <div className="text-sm opacity-60">Vibe score</div>
      <div className="text-[9rem] font-extrabold leading-none text-accent">{p.score}</div>
      <div className="mt-2 text-xl">{p.title}</div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">{p.categories.map((c) => <span key={c} className="rounded-full border border-paper/30 px-3 py-1 text-sm">{c}</span>)}</div>
    </section>
    <section className="grid grid-cols-2 gap-6 sm:grid-cols-5">{[stat(s.transactions, "Transactions"), stat(s.contracts, "Contracts"), stat(s.activeDays, "Active days"), stat(s.deployments, "Contracts deployed"), stat(s.tokens, "Tokens")]}</section>
    <section className="mt-12"><h3 className="text-lg font-semibold">Your onchain vibe</h3><p className="mt-2 max-w-prose opacity-80">{p.summary}</p></section>
    <section className="mt-12"><h3 className="text-lg font-semibold">Score breakdown</h3>
      {Object.entries(p.breakdown).map(([k, v]) => { const cap = k === "activity" || k === "exploration" ? 200 : 150; return <div key={k} className="mt-3"><div className="flex justify-between text-sm"><span className="capitalize">{k}</span><span>{v} / {cap}</span></div><div className="mt-1 h-2 rounded bg-paper/10"><div className="h-2 rounded bg-accent" style={{ width: `${(v / cap) * 100}%` }} /></div></div>; })}
      <details className="mt-4 text-sm opacity-80"><summary className="cursor-pointer">How is this calculated?</summary>
        <p className="mt-2">Vibe Score is an experimental activity metric from 0 to 1000. It uses transaction count, distinct contracts, active days, distinct methods and tokens, variety of activity types, and contract deployments. Each part is log or linear scaled with a cap. Balance and trading profit are never used. It does not measure financial performance or personal worth.</p></details></section>
    {p.weekly.length > 0 && <section className="mt-12"><h3 className="text-lg font-semibold">Activity per week</h3>
      <p className="text-sm opacity-60">Transactions per week, starting {new Date(s.first!).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{p.weekly.map((w, i) => <div key={i} className="min-w-[44px] max-w-[64px] flex-1">
        <div className="mb-1 text-center text-xs font-semibold">{w}</div>
        <div className="flex h-28 items-end border-b border-paper/20"><div className="w-full rounded-t bg-accent" style={{ height: `${Math.max(4, (w / max) * 100)}%` }} /></div>
        <div className="mt-1 text-center text-xs opacity-60">{new Date(+new Date(s.first!) + i * 6048e5).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div></div>)}</div></section>}
    <section className="mt-12"><h3 className="text-lg font-semibold">What you do</h3>
      {p.distribution.map((d) => <div key={d.label} className="mt-2 flex justify-between text-sm"><span>{d.label}</span><span>{d.pct}%</span></div>)}</section>
    <section className="mt-12"><h3 className="text-lg font-semibold">Achievements</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{p.achievements.map((a) => <div key={a.id} className={`rounded-xl border border-paper/20 p-4 ${a.unlocked ? "" : "opacity-40"}`}>
        <div className="font-medium">{a.icon} {a.name}</div><div className="text-sm opacity-70">{a.desc}</div>
        <div className="mt-2 text-xs">{a.unlocked ? "Unlocked" : "Locked"}</div>{owner && <Claim id={a.id} canClaim={a.unlocked} />}</div>)}</div></section>
    {p.activity.length > 0 && <section className="mt-12"><h3 className="text-lg font-semibold">Recent activity</h3>
      {p.activity.map((t) => <div key={t.hash} className="mt-3 flex justify-between border-b border-paper/10 pb-2 text-sm">
        <div><div>{t.type}</div><div className="opacity-60">{new Date(t.ts).toLocaleDateString()} {t.counterparty && `· ${short(t.counterparty)}`}</div></div>
        <a className="text-accent" href={`${EXPLORER}/tx/${t.hash}`} target="_blank">View transaction ↗</a></div>)}</section>}
    <footer className="mt-12 flex flex-wrap items-center gap-4 text-sm">
      <button onClick={share} className="rounded-full bg-paper px-5 py-2 font-semibold text-ink">{copied ? "Link copied" : "Share VibeID"}</button>
      {onRefresh && <button onClick={onRefresh} disabled={refreshing} className="underline disabled:opacity-50">{refreshing ? "Refreshing..." : "Refresh"}</button>}
      <span className="opacity-60">{refreshing ? "Fetching latest activity" : mins < 1 ? "Last analyzed just now" : `Last analyzed ${mins} min ago`}</span>
      {error && <span className="w-full text-red-300">{error}</span>}</footer>
  </main>;
}
