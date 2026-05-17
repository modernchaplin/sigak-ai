import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIGAK.AI",
  description: "AI 시대를 보는 시각",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    { href: "/#time", label: "시간" },
    { href: "/#people", label: "사람" },
    { href: "/#map", label: "지도" },
    { href: "/#archive", label: "기록" },
    { href: "/#view", label: "시각" },
  ];

  return (
    <html lang="ko" className="min-h-screen bg-black">
      <body className="min-h-screen bg-[#050505] text-white">
        <header className="sticky top-0 z-20 w-full border-b border-white/10 bg-black text-white backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
            <Link href="/" className="tracking-[0.2em] text-xl font-semibold">
              SIGAK.AI
            </Link>
            <nav className="flex items-center gap-2 text-sm md:gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-zinc-700 px-3 py-1.5 text-zinc-300 transition hover:border-yellow-300 hover:text-yellow-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] w-full bg-[#050505]">{children}</main>
      </body>
    </html>
  );
}
