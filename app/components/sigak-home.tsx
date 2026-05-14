"use client";

import { useEffect, useMemo, useState } from "react";
import SigakDetailModal from "@/app/components/sigak-detail-modal";

export type SigakTopic = {
  id: string;
  title: string;
  summary: string;
};

export type SigakAxis = {
  id: string;
  title: string;
  description: string;
  role: string;
  topics: SigakTopic[];
};

type SigakHomeProps = {
  axes: SigakAxis[];
};

export default function SigakHome({ axes }: SigakHomeProps) {
  const [activeAxisId, setActiveAxisId] = useState(axes[0]?.id ?? "time");
  const [selectedTopic, setSelectedTopic] = useState<SigakTopic | null>(null);

  const activeAxis = useMemo(
    () => axes.find((axis) => axis.id === activeAxisId) ?? axes[0],
    [activeAxisId, axes],
  );

  useEffect(() => {
    const syncAxisFromHash = () => {
      const axisId = window.location.hash.replace("#", "");

      if (axes.some((axis) => axis.id === axisId)) {
        setActiveAxisId(axisId);
      }
    };

    syncAxisFromHash();
    window.addEventListener("hashchange", syncAxisFromHash);

    return () => window.removeEventListener("hashchange", syncAxisFromHash);
  }, [axes]);

  const selectAxis = (axisId: string) => {
    setActiveAxisId(axisId);
    window.history.replaceState(null, "", `#${axisId}`);
  };

  return (
    <section className="sigak-mvp -mx-4 -my-8 min-h-[calc(100vh-4rem)] px-4 py-10 text-white md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 border-b border-zinc-800 pb-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="mono text-xs tracking-[0.22em] text-yellow-300">
              AI 시대를 보는 시각
            </p>
            <h1 className="mt-4 max-w-3xl text-6xl font-semibold leading-[1.02] md:text-8xl">
              sigak.ai
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-zinc-300 md:justify-self-end">
            AI의 과거, 현재, 미래를 시간순으로 연결하고 중요한 인물, 사건, 개념을
            쉽게 해석해 이 시대가 어디로 향하는지 보여줍니다.
          </p>
        </div>

        <div id="axes" className="mt-8">
          <div className="grid gap-3 md:grid-cols-5" role="tablist" aria-label="sigak.ai 5축">
            {axes.map((axis, index) => {
              const isActive = axis.id === activeAxisId;

              return (
                <button
                  id={axis.id}
                  key={axis.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="axis-topics"
                  onClick={() => selectAxis(axis.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    isActive
                      ? "border-yellow-300 bg-yellow-300 text-black"
                      : "border-zinc-800 bg-zinc-950/72 text-white hover:border-zinc-600"
                  }`}
                >
                  <p
                    className={`mono text-xs ${
                      isActive ? "text-black/60" : "text-yellow-300"
                    }`}
                  >
                    0{index + 1}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">{axis.title}</h2>
                  <p
                    className={`mt-3 text-sm leading-6 ${
                      isActive ? "text-black/75" : "text-zinc-400"
                    }`}
                  >
                    {axis.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {activeAxis && (
          <section
            id="axis-topics"
            role="tabpanel"
            className="mt-8 border-t border-zinc-800 pt-7"
          >
            <div className="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)]">
              <div>
                <p className="mono text-xs tracking-[0.2em] text-yellow-300">
                  {activeAxis.title}
                </p>
                <h2 className="mt-3 text-3xl font-semibold">{activeAxis.description}</h2>
                <p className="mt-4 text-sm leading-6 text-zinc-400">{activeAxis.role}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activeAxis.topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className="group min-h-36 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-yellow-300/70"
                  >
                    <p className="mono text-[11px] tracking-[0.16em] text-zinc-500">
                      {activeAxis.title}
                    </p>
                    <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-yellow-200">
                      {topic.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{topic.summary}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <SigakDetailModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
    </section>
  );
}
