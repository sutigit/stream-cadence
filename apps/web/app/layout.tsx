import type { Metadata } from "next";
import { Funnel_Sans } from "next/font/google"
import "./globals.css";
import Link from "next/link";
import { GitBranch } from "lucide-react";

const font = Funnel_Sans({ subsets: ['latin'], weight: ['300', '400', '600', '700', '800'] })

export const metadata: Metadata = {
  title: "Stream cadence",
  description: "Stream your text with natural human speech-like cadence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} antialised`}>
        <nav className="container mx-auto py-6 flex justify-between">
          <div className="flex gap-5">
            <Link className="font-bold" href="/">Package</Link>
            <Link href="/">Learn</Link>
            <Link href="/">Reference</Link>
            <Link href="/">Examples</Link>
          </div>
          <Link
            href="https://github.com/sutigit/stream-cadence"
            target="_blank"
            className="flex items-center gap-1 font-bold"
          >
            <GitBranch className="w-4 h-4" />
            <span>Github</span>
          </Link>

        </nav>
        {children}
      </body>
    </html>
  );
}
