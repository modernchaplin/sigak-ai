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
    <html lang="ko" className="min-h-screen bg-[#f7f8f5]">
      <body className="min-h-screen bg-[#f7f8f5] text-[#111111]">
        <header className="sticky top-0 z-20 w-full border-b border-zinc-200 bg-white/90 text-[#111111] shadow-sm backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
            <Link href="/" className="tracking-[0.2em] text-xl font-semibold text-[#0f172a]">
              SIGAK.AI
            </Link>
            <nav className="flex items-center gap-2 text-sm md:gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] w-full bg-[#f7f8f5]">{children}</main>
      </body>
    </html>
  );
}
