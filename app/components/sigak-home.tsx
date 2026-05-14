"use client";

import { useEffect, useMemo, useState } from "react";

export type SigakTopic = {
  id: string;
  title: string;
  axis: string;
  summary: string;
  description: string;
  sections: {
    what: string;
    why: string;
    sigak: string;
    flow: string;
    question: string;
  };
  tags: string[];
  relatedIds: string[];
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
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const allTopics = useMemo(() => axes.flatMap((axis) => axis.topics), [axes]);

  const activeAxis = useMemo(
    () => axes.find((axis) => axis.id === activeAxisId) ?? axes[0],
    [activeAxisId, axes],
  );

  const selectedTopic = useMemo(
    () => allTopics.find((topic) => topic.id === selectedTopicId) ?? null,
    [allTopics, selectedTopicId],
  );

  const relatedTopics = useMemo(() => {
    if (!selectedTopic) {
      return [];
    }

    return selectedTopic.relatedIds
      .map((id) => allTopics.find((topic) => topic.id === id))
      .filter((topic): topic is SigakTopic => Boolean(topic));
  }, [allTopics, selectedTopic]);

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
    setSelectedTopicId(null);
    window.history.replaceState(null, "", `#${axisId}`);
  };

  if (selectedTopic) {
    return (
      <section className="sigak-mvp -mx-4 -my-8 min-h-[calc(100vh-4rem)] px-4 py-10 text-white md:px-6 md:py-14">
        <article className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => setSelectedTopicId(null)}
            className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-yellow-300 hover:text-yellow-200"
          >
            뒤로가기
          </button>

          <div className="mt-8 border-b border-zinc-800 pb-8">
            <p className="mono text-xs tracking-[0.2em] text-yellow-300">
              {selectedTopic.axis}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
              {selectedTopic.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-300">
              {selectedTopic.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {selectedTopic.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            <DetailSection title="무슨 내용인가" body={selectedTopic.sections.what} />
            <DetailSection title="왜 중요한가" body={selectedTopic.sections.why} />
            <DetailSection
              title="SIGAK.AI의 시각"
              body={selectedTopic.sections.sigak}
              emphasized
            />
            <DetailSection title="이어지는 흐름" body={selectedTopic.sections.flow} />
            <DetailSection title="남는 질문" body={selectedTopic.sections.question} emphasized />
          </div>

          {relatedTopics.length > 0 && (
            <section className="mt-10 border-t border-zinc-800 pt-7">
              <p className="mono text-xs tracking-[0.2em] text-yellow-300">관련 콘텐츠</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {relatedTopics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-yellow-300/70"
                  >
                    <p className="mono text-[11px] tracking-[0.16em] text-zinc-500">
                      {topic.axis}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-white">{topic.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{topic.summary}</p>
                  </button>
                ))}
              </div>
            </section>
          )}
        </article>
      </section>
    );
  }

  return (
    <section className="sigak-mvp -mx-4 -my-8 min-h-[calc(100vh-4rem)] px-4 py-10 text-white md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 border-b border-zinc-800 pb-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="mono text-xs tracking-[0.22em] text-yellow-300">
              AI 시대를 보는 시각
            </p>
            <h1 className="mt-4 max-w-3xl text-6xl font-semibold leading-[1.02] md:text-8xl">
              SIGAK.AI
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-zinc-300 md:justify-self-end">
            AI의 과거, 현재, 미래를 시간순으로 연결하고 중요한 인물, 사건, 개념을
            쉽게 해석해 이 시대가 어디로 향하는지 보여줍니다.
          </p>
        </div>

        <div id="axes" className="mt-8">
          <div className="grid gap-3 md:grid-cols-5" role="tablist" aria-label="SIGAK.AI 5축">
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
                    onClick={() => setSelectedTopicId(topic.id)}
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
    </section>
  );
}

function DetailSection({
  title,
  body,
  emphasized = false,
}: {
  title: string;
  body: string;
  emphasized?: boolean;
}) {
  return (
    <section
      className={`rounded-lg border p-5 ${
        emphasized
          ? "border-yellow-300/35 bg-yellow-300/8"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <h2 className="text-sm font-semibold text-yellow-200">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-zinc-300">{body}</p>
    </section>
  );
}
