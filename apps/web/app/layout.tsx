import type { Metadata } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { Space_Grotesk } from "next/font/google";

const font = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Web3 dApp POC",
  description: "Wallet connect, contract read/write, and GraphQL feed."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${font.className} bg-slate-950 text-slate-50`}>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
