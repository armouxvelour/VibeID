import { isAddress } from "viem";
import Link from "next/link";
import ProfileView from "@/components/ProfileView";
import { analyze } from "@/lib/analyze";
export async function generateMetadata({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return { title: `VibeID ${address.slice(0, 6)}...`, openGraph: { title: "VibeID", description: "What does this wallet say?", images: ["/og.png"] }, twitter: { card: "summary_large_image", images: ["/og.png"] } };
}
export default async function Public({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  if (!isAddress(address)) return <p className="p-10">Invalid wallet address.</p>;
  const p = await analyze(address).catch(() => null);
  if (!p) return <p className="p-10">Couldn&apos;t load this profile right now.</p>;
  return <><ProfileView p={p} /><p className="pb-6 text-center"><Link href="/" className="text-accent">Analyze your wallet →</Link></p></>;
}
