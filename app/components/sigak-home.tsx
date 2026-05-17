"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ViewMode = "home" | "axis" | "detail";

type TopicTimelineItem = {
  year: string;
  label: string;
};

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
  timelineItems?: TopicTimelineItem[];
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
  const [viewMode, setViewMode] = useState<ViewMode>("home");
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

  const findAxisIdForTopic = useCallback(
    (topicId: string) =>
      axes.find((axis) => axis.topics.some((topic) => topic.id === topicId))?.id ??
      activeAxisId,
    [activeAxisId, axes],
  );

  const showHome = () => {
    setViewMode("home");
    setSelectedTopicId(null);
    window.history.pushState(null, "", window.location.pathname);
  };

  const selectAxis = (axisId: string) => {
    setActiveAxisId(axisId);
    setSelectedTopicId(null);
    setViewMode("axis");
    window.history.pushState(null, "", `#${axisId}`);
  };

  const openTopic = (topicId: string) => {
    setActiveAxisId(findAxisIdForTopic(topicId));
    setSelectedTopicId(topicId);
    setViewMode("detail");
    window.history.pushState(null, "", `#topic-${topicId}`);
  };

  const backToAxis = () => {
    setSelectedTopicId(null);
    setViewMode("axis");
    window.history.pushState(null, "", `#${activeAxisId}`);
  };

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "");

      if (!hash) {
        setViewMode("home");
        setSelectedTopicId(null);
        return;
      }

      if (hash.startsWith("topic-")) {
        const topicId = hash.replace("topic-", "");
        const topic = allTopics.find((item) => item.id === topicId);

        if (topic) {
          setActiveAxisId(findAxisIdForTopic(topic.id));
          setSelectedTopicId(topic.id);
          setViewMode("detail");
        }

        return;
      }

      if (axes.some((axis) => axis.id === hash)) {
        setActiveAxisId(hash);
        setSelectedTopicId(null);
        setViewMode("axis");
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, [allTopics, axes, findAxisIdForTopic]);

  if (viewMode === "detail" && selectedTopic) {
    return (
      <TopicDetailView
        topic={selectedTopic}
        relatedTopics={relatedTopics}
        onBack={backToAxis}
        onOpenTopic={openTopic}
      />
    );
  }

  return (
    <section className="sigak-mvp min-h-[calc(100vh-4rem)] w-full px-4 py-10 text-white md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Hero />

        <div id="axes" className="mt-9">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="mono text-xs tracking-[0.22em] text-yellow-300">5개의 축</p>
            {viewMode === "axis" && (
              <button
                type="button"
                onClick={showHome}
                className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-yellow-300 hover:text-yellow-200"
              >
                전체 축 보기
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-5" role="tablist" aria-label="SIGAK.AI 5축">
            {axes.map((axis, index) => {
              const isActive = viewMode === "axis" && axis.id === activeAxisId;

              return (
                <button
                  id={axis.id}
                  key={axis.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="axis-topics"
                  onClick={() => selectAxis(axis.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    isActive
                      ? "border-yellow-300 bg-yellow-300 text-black"
                      : "border-zinc-800 bg-zinc-950/72 text-white hover:-translate-y-0.5 hover:border-yellow-300/60"
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

        {viewMode === "home" && (
          <HomeArchiveIntro axes={axes} />
        )}

        {viewMode === "axis" && activeAxis && (
          <AxisTopicGateway axis={activeAxis} onOpenTopic={openTopic} />
        )}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <div className="grid gap-8 border-b border-zinc-800 pb-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
      <div>
        <p className="mono text-xs tracking-[0.22em] text-yellow-300">
          AI 시대를 보는 시각
        </p>
        <h1 className="mt-4 max-w-3xl text-6xl font-semibold leading-[1.02] md:text-8xl">
          SIGAK.AI
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {["과거", "현재", "미래", "사람", "질문"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-400"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <p className="max-w-xl text-base leading-8 text-zinc-300 md:justify-self-end">
        AI의 과거, 현재, 미래를 시간순으로 연결하고 중요한 인물, 사건, 개념을 쉽게
        해석해 이 시대가 어디로 향하는지 보여줍니다.
      </p>
    </div>
  );
}

function HomeArchiveIntro({ axes }: { axes: SigakAxis[] }) {
  return (
    <section className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/55 p-5 md:p-7">
        <p className="mono text-xs tracking-[0.2em] text-yellow-300">탐색 방식</p>
        <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
          먼저 하나의 축을 고르면, 그 아래 콘텐츠 입구가 열립니다.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
          SIGAK.AI는 뉴스를 빠르게 소비하는 곳이 아니라, AI 시대의 사건과 인물,
          개념을 서로 연결해 방향 감각을 만드는 아카이브입니다.
        </p>
      </div>

      <div className="rounded-2xl border border-yellow-300/25 bg-yellow-300/8 p-5 md:p-7">
        <p className="mono text-xs tracking-[0.2em] text-yellow-300">현재 구조</p>
        <p className="mt-3 text-4xl font-semibold text-white">
          {axes.reduce((count, axis) => count + axis.topics.length, 0)}
          <span className="ml-2 text-sm font-normal text-zinc-400">개의 콘텐츠 입구</span>
        </p>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          모든 콘텐츠는 시간, 사람, 지도, 기록, 시각이라는 5개의 관점 아래에 놓입니다.
        </p>
      </div>
    </section>
  );
}

function AxisTopicGateway({
  axis,
  onOpenTopic,
}: {
  axis: SigakAxis;
  onOpenTopic: (topicId: string) => void;
}) {
  return (
    <section id="axis-topics" role="tabpanel" className="mt-8 border-t border-zinc-800 pt-7">
      <div className="grid gap-7 md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 md:sticky md:top-24 md:self-start">
          <p className="mono text-xs tracking-[0.2em] text-yellow-300">{axis.title}</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">{axis.description}</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{axis.role}</p>
          <div className="mt-6 h-px bg-zinc-800" />
          <p className="mt-5 text-xs leading-6 text-zinc-500">
            아래 항목들은 요약 카드가 아니라 각각 하나의 콘텐츠 화면으로 들어가는 입구입니다.
          </p>
          <p className="mt-4 rounded-full border border-zinc-800 px-3 py-2 text-xs text-zinc-400">
            {axis.topics.length}개 콘텐츠
          </p>
        </aside>

        <div className="grid gap-3">
          {axis.topics.map((topic, index) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => onOpenTopic(topic.id)}
              className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-left transition hover:border-yellow-300/70 hover:bg-zinc-900/80"
            >
              <div className="flex gap-4">
                <span className="mono mt-1 text-xs text-yellow-300/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-semibold leading-tight text-white group-hover:text-yellow-200">
                      {topic.title}
                    </h3>
                    <span className="hidden shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 group-hover:border-yellow-300/70 group-hover:text-yellow-200 sm:inline-flex">
                      상세 화면으로
                    </span>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                    {topic.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {topic.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-zinc-800 px-2.5 py-1 text-xs text-zinc-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function TopicDetailView({
  topic,
  relatedTopics,
  onBack,
  onOpenTopic,
}: {
  topic: SigakTopic;
  relatedTopics: SigakTopic[];
  onBack: () => void;
  onOpenTopic: (topicId: string) => void;
}) {
  const sections = getDetailSections(topic);

  return (
    <section className="sigak-mvp min-h-[calc(100vh-4rem)] w-full px-4 py-10 text-white md:px-6 md:py-14">
      <article className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-yellow-300 hover:text-yellow-200"
        >
          뒤로가기
        </button>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 px-5 py-7 md:px-8 md:py-10">
          <p className="mono text-xs tracking-[0.2em] text-yellow-300">
            SIGAK.AI / {topic.axis} / 전용 상세 화면
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-7xl">
            {topic.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
            {topic.summary}
          </p>
          {topic.description !== topic.summary && (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-500">
              {topic.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {topic.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-zinc-700 bg-black px-2.5 py-1 text-xs text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <DetailSection
              key={section.title}
              title={section.title}
              body={section.body}
              emphasized={section.emphasized}
              wide={section.wide}
            />
          ))}
        </div>

        {topic.timelineItems && topic.timelineItems.length > 0 && (
          <TimelineBlock items={topic.timelineItems} />
        )}

        {relatedTopics.length > 0 && (
          <section className="mt-10 border-t border-zinc-800 pt-7">
            <p className="mono text-xs tracking-[0.2em] text-yellow-300">관련 콘텐츠</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {relatedTopics.map((relatedTopic) => (
                <button
                  key={relatedTopic.id}
                  type="button"
                  onClick={() => onOpenTopic(relatedTopic.id)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-yellow-300/70 hover:bg-zinc-900/80"
                >
                  <p className="mono text-[11px] tracking-[0.16em] text-zinc-500">
                    {relatedTopic.axis}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{relatedTopic.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{relatedTopic.summary}</p>
                </button>
              ))}
            </div>
          </section>
        )}
      </article>
    </section>
  );
}

function getDetailSections(topic: SigakTopic) {
  if (topic.id === "agi-timeline") {
    return [
      { title: "AGI란 무엇인가", body: topic.sections.what },
      { title: "왜 중요한가", body: topic.sections.why },
      { title: "주요 흐름", body: topic.sections.flow },
      {
        title: "SIGAK.AI의 시각",
        body: topic.sections.sigak,
        emphasized: true,
        wide: true,
      },
      { title: "남는 질문", body: topic.sections.question, emphasized: true },
    ];
  }

  return [
    { title: "무슨 내용인가", body: topic.sections.what },
    { title: "왜 중요한가", body: topic.sections.why },
    {
      title: "SIGAK.AI의 시각",
      body: topic.sections.sigak,
      emphasized: true,
      wide: true,
    },
    { title: "이어지는 흐름", body: topic.sections.flow },
    { title: "남는 질문", body: topic.sections.question, emphasized: true },
  ];
}

function DetailSection({
  title,
  body,
  emphasized = false,
  wide = false,
}: {
  title: string;
  body: string;
  emphasized?: boolean;
  wide?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 ${wide ? "md:col-span-2" : ""} ${
        emphasized
          ? "border-yellow-300/35 bg-yellow-300/8"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <h2 className="text-sm font-semibold text-yellow-200">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-300">{body}</p>
    </section>
  );
}

function TimelineBlock({ items }: { items: TopicTimelineItem[] }) {
  return (
    <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
      <p className="mono text-xs tracking-[0.2em] text-yellow-300">간단한 타임라인</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={`${item.year}-${item.label}`} className="flex gap-4 rounded-xl border border-zinc-800 bg-black p-4">
            <p className="mono w-20 shrink-0 text-sm text-yellow-300">{item.year}</p>
            <p className="text-sm leading-6 text-zinc-300">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
