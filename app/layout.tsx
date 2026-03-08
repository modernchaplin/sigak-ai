import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIGAK.AI",
  description: "SIGAK.AI MVP skeleton",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    { href: "/history", label: "역사" },
    { href: "/speed", label: "속도체험" },
    { href: "/future", label: "미래" },
    { href: "/glossary", label: "용어" },
  ];

  return (
    <html lang="ko">
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
        <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
            <Link href="/" className="tracking-[0.2em] text-xl font-semibold">
              SIGAK.AI
            </Link>
            <nav className="flex items-center gap-2 text-sm md:gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-black/10 px-3 py-1.5 transition hover:border-black/30"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
