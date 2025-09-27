import type { Metadata } from "next";
import { Funnel_Sans } from "next/font/google"
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
