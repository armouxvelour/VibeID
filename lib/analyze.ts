import { fetchTxs, fetchTransfers, fetchHeld, createdByTx, isToken, chunked } from "./provider";
import type { Profile, Tx } from "./types";
const lg = (n: number, cap: number) => Math.min(1, Math.log(1 + n) / Math.log(1 + cap));
const r = Math.round;

export async function analyze(address: string): Promise<Profile> {
  const a = address.toLowerCase();
  const [txs, transfers, held] = await Promise.all([fetchTxs(a), fetchTransfers(a), fetchHeld(a)]);
  const days = new Set<string>(), contracts = new Set<string>(), methods = new Set<string>(), tokens = new Set<string>();
  const created = new Set<string>(); const maybeFactory: string[] = [];
  let failed = 0, swaps = 0, calls = 0, natives = 0;
  const activity: Tx[] = [];
  for (const t of txs) {
    days.add(String(t.timestamp).slice(0, 10));
    if (t.status === "error") failed++;
    const to = t.to?.hash?.toLowerCase();
    let type = "Other";
    if (t.created_contract) { created.add(String(t.created_contract.hash).toLowerCase()); type = "Contract deployed"; }
    else if (/swap/i.test(t.method ?? "")) { swaps++; type = "Token swap"; }
    else if (t.to?.is_contract) { type = "Contract call"; calls++; if (t.status !== "error" && maybeFactory.length < 25 && (!t.method || /creat|deploy|launch|new|clone|mint/i.test(t.method))) maybeFactory.push(t.hash); }
    else if (BigInt(t.value ?? "0") > 0n) { type = "ETH transfer"; natives++; }
    if (t.to?.is_contract && to) contracts.add(to);
    if (t.method) methods.add(t.method);
    activity.push({ hash: t.hash, ts: t.timestamp, type, counterparty: t.created_contract?.hash ?? t.to?.hash ?? null });
  }
  // Contracts created inside a call (factories, token launchers) show up as internal transactions.
  const fres = await chunked(maybeFactory, 5, createdByTx);
  const deployTx = new Set<string>();
  fres.forEach((cs, i) => { if (cs.length) deployTx.add(maybeFactory[i]); cs.forEach((c) => created.add(c.toLowerCase())); });
  for (const t of activity) if (deployTx.has(t.hash)) t.type = "Contract deployed";
  const cnt = (ty: string) => activity.filter((t) => t.type === ty).length;
  const tokenAddr = (x: any) => (x?.address_hash ?? x?.address)?.toLowerCase();
  for (const h of held) { const t = tokenAddr(h.token); if (t) tokens.add(t); }
  const createdList = [...created];
  (await chunked(createdList, 5, async (c) => ((await isToken(c)) ? c : null))).forEach((c) => c && tokens.add(c));
  const deployments = created.size;
  let nft = 0;
  for (const x of transfers) {
    { const t = tokenAddr(x.token); if (t) tokens.add(t); }
    if (/721|1155/.test(x.token?.type ?? "")) nft++;
  }
  const n = txs.length, ad = days.size;
  const breakdown = {
    activity: r(200 * lg(n, 500)), exploration: r(200 * lg(contracts.size, 50)),
    consistency: r(150 * Math.min(1, ad / 30)), diversity: r(150 * Math.min(1, (methods.size + tokens.size) / 30)),
    experimentation: r(150 * Math.min(1, [swaps, nft, deployments, natives, tokens.size].filter(Boolean).length / 5)),
    builder: r(150 * Math.min(1, deployments / 5)),
  };
  const score = Object.values(breakdown).reduce((s, v) => s + v, 0);
  const categories = [
    swaps >= 3 && "Trader", deployments >= 1 && "Builder", nft >= 1 && "Collector",
    n >= 100 && "Power User", contracts.size >= 10 && "Explorer", ad >= 7 && "Active Wallet",
  ].filter(Boolean) as string[];
  const title = score >= 700 ? "Power Explorer" : score >= 400 ? "Active Explorer" : score >= 100 ? "Rising Explorer" : n ? "Just Getting Started" : "New Wallet";
  const pct = (v: number) => (n ? r((v / n) * 100) : 0);
  const distribution = [
    { label: "Swaps", pct: pct(cnt("Token swap")) }, { label: "Contract calls", pct: pct(cnt("Contract call")) },
    { label: "ETH transfers", pct: pct(cnt("ETH transfer")) }, { label: "Contract deployments", pct: pct(cnt("Contract deployed")) },
    { label: "Other", pct: pct(cnt("Other")) },
  ];

  const dated = txs.map((t) => +new Date(t.timestamp)).sort((x, y) => x - y);
  const weekly: number[] = [];
  if (dated.length) { const w0 = dated[0], W = 6048e5; const last = Math.floor((dated[n - 1] - w0) / W); for (let i = 0; i <= last; i++) weekly[i] = 0; dated.forEach((d) => { weekly[Math.floor((d - w0) / W)]++; }); }
  const A = [
    [1, "First Step", "🌱", "Made your first transaction", n >= 1], [2, "Explorer", "🧭", "Interacted with 10+ contracts", contracts.size >= 10],
    [3, "Power User", "⚡", "100+ transactions", n >= 100], [4, "Builder", "🔨", "Deployed a smart contract", deployments >= 1],
    [5, "DeFi Curious", "🌊", "Swap-like activity 3+ times", swaps >= 3], [6, "Consistent", "📅", "Active on 7+ different days", ad >= 7],
  ] as const;
  const parts = [
    n ? `This wallet has ${n} transactions on Robinhood Chain Testnet across ${ad} active day${ad === 1 ? "" : "s"}.` : "No transactions found for this wallet.",
    contracts.size ? `It has interacted with ${contracts.size} distinct contract${contracts.size === 1 ? "" : "s"}.` : "",
    swaps ? `Swap-like activity was detected in ${swaps} transaction${swaps === 1 ? "" : "s"}.` : "",
    deployments ? `It deployed ${deployments} contract${deployments === 1 ? "" : "s"}.` : "",
    failed ? `${failed} transaction${failed === 1 ? "" : "s"} failed.` : "",
    txs.length >= 500 ? "Only the most recent 500 transactions were analyzed." : "",
  ];
  return {
    address: a, network: "robinhood-testnet", analyzedAt: Date.now(), score, title, categories,
    stats: { transactions: n, failed, contracts: contracts.size, deployments, activeDays: ad, tokens: tokens.size, swaps, nftTransfers: nft, first: n ? new Date(dated[0]).toISOString() : null, last: n ? new Date(dated[n - 1]).toISOString() : null },
    breakdown, distribution, weekly, activity: activity.slice(0, 15),
    achievements: A.map(([id, name, icon, desc, unlocked]) => ({ id, name, icon, desc, unlocked })),
    summary: parts.filter(Boolean).join(" "),
  };
}
