"use client";

import { useState } from "react";

export type InfographicItem = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  facts: string[];
  sihunView: string;
};

type InfographicListProps = {
  heading: string;
  caption: string;
  items: InfographicItem[];
};

export default function InfographicList({
  heading,
  caption,
  items,
}: InfographicListProps) {
  const [showSihunView, setShowSihunView] = useState(false);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-black/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="mono text-xs tracking-[0.16em] text-slate-500">
            INFOGRAPHIC MODE
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-sm text-slate-600">{caption}</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-end">
          <button
            type="button"
            onClick={() => setShowSihunView((prev) => !prev)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              showSihunView
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-black/20 bg-white text-slate-800 hover:border-black/40"
            }`}
          >
            송시헌의 시각 {showSihunView ? "숨기기" : "보기"}
          </button>
          <span className="mono text-xs text-slate-500">정보 70% / 내 통찰 30%</span>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className={`grid gap-3 ${showSihunView ? "md:grid-cols-[7fr_3fr]" : "grid-cols-1"}`}
          >
            <div className="info-card rounded-2xl p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="badge mono rounded-full px-3 py-1 text-xs tracking-widest text-slate-700">
                  {item.badge}
                </span>
                <span className="mono text-xs text-slate-500">{item.subtitle}</span>
              </div>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>
              <ul className="mt-3 space-y-1">
                {item.facts.map((fact) => (
                  <li key={fact} className="mono text-xs text-slate-600">
                    - {fact}
                  </li>
                ))}
              </ul>
            </div>

            {showSihunView && (
              <aside className="info-card rounded-2xl border-l-2 border-l-blue-700 p-5">
                <p className="mono text-xs tracking-[0.15em] text-blue-700">SONG SIHEON VIEW</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.sihunView}</p>
              </aside>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
