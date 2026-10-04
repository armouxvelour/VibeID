// Data provider. Swap this file to use another indexer. Assumes a Blockscout v2 API on the explorer host.
import { EXPLORER } from "./chain";
async function get(path: string, q: Record<string, any> = {}) {
  const u = new URL(EXPLORER + path); Object.entries(q).forEach(([k, v]) => u.searchParams.set(k, String(v)));
  const r = await fetch(u, { cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (!r.ok) throw new Error("PROVIDER_" + r.status);
  return r.json();
}
async function pages(path: string, max = 10) {
  const out: any[] = []; let next: any = {};
  for (let i = 0; i < max; i++) {
    const j = await get(path, next); out.push(...(j.items ?? []));
    if (!j.next_page_params) break; next = j.next_page_params;
  }
  return out;
}
export const fetchTxs = (a: string) => pages(`/api/v2/addresses/${a}/transactions`);
export const fetchTransfers = (a: string) => pages(`/api/v2/addresses/${a}/token-transfers`, 4).catch(() => []);
export const fetchHeld = (a: string) => pages(`/api/v2/addresses/${a}/tokens`, 2).catch(() => []);
export async function createdByTx(hash: string): Promise<string[]> {
  try { const j = await get(`/api/v2/transactions/${hash}/internal-transactions`); return (j.items ?? []).map((i: any) => i.created_contract?.hash).filter(Boolean); } catch { return []; }
}
export async function isToken(addr: string) { try { await get(`/api/v2/tokens/${addr}`); return true; } catch { return false; } }
export async function chunked<T, R>(xs: T[], n: number, f: (x: T) => Promise<R>) {
  const out: R[] = []; for (let i = 0; i < xs.length; i += n) out.push(...(await Promise.all(xs.slice(i, i + n).map(f)))); return out;
}
