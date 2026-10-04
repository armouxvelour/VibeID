export type Tx = { hash: string; ts: string; type: string; counterparty: string | null };
export type Profile = {
  address: string; network: "robinhood-testnet"; analyzedAt: number;
  score: number; title: string; categories: string[];
  stats: { transactions: number; failed: number; contracts: number; deployments: number; activeDays: number; tokens: number; swaps: number; nftTransfers: number; first: string | null; last: string | null };
  breakdown: Record<"activity" | "exploration" | "consistency" | "diversity" | "experimentation" | "builder", number>;
  distribution: { label: string; pct: number }[];
  weekly: number[]; activity: Tx[];
  achievements: { id: number; name: string; icon: string; desc: string; unlocked: boolean }[];
  summary: string;
};
