import { isAddress } from "viem";
import { analyze } from "@/lib/analyze";
const cache = new Map<string, any>();
export async function GET(req: Request, ctx: { params: Promise<{ address: string }> }) {
  const a = (await ctx.params).address;
  if (!isAddress(a)) return Response.json({ error: "Invalid wallet address." }, { status: 400 });
  const fresh = new URL(req.url).searchParams.get("fresh") === "1";
  const hit = cache.get(a.toLowerCase());
  if (hit && !fresh && Date.now() - hit.analyzedAt < 120_000) return Response.json(hit);
  try { const p = await analyze(a); cache.set(a.toLowerCase(), p); return Response.json(p); }
  catch (e: any) {
    const msg = e.message === "RATE_LIMIT" ? "The explorer is rate limiting requests. Try again in a minute." : "Couldn't reach Robinhood Chain Testnet data. Try again shortly.";
    return Response.json({ error: msg }, { status: 502 });
  }
}
