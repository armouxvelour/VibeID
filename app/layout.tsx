import "./globals.css";
import { Bricolage_Grotesque } from "next/font/google";
import Providers from "@/components/Providers";
const f = Bricolage_Grotesque({ subsets: ["latin"], display: "swap" });
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "VibeID",
  description: "What does your wallet say about you? Turn your Robinhood Chain Testnet activity into a profile.",
  openGraph: { title: "VibeID", description: "What does your wallet say about you?", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "VibeID", description: "What does your wallet say about you?", images: ["/og.png"] },
};
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={f.className}><Providers>{children}</Providers></body></html>;
}
