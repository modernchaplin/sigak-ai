"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ViewMode = "home" | "axis" | "detail";

type TopicTimelineItem = {
  year: string;
  label: string;
  ability?: string;
  description?: string;
};

type PerspectiveItem = {
  name: string;
  focus: string;
  reading: string;
  sourceNote: string;
  sourceUrl?: string;
};

type ObservationMetric = {
  title: string;
  description: string;
};

type ScenarioItem = {
  title: string;
  description: string;
};

type AgiForecast = {
  id: string;
  name: string;
  organization: string;
  role: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  imageSourceUrl: string;
  imageLicense: string;
  imageStatus: "verified" | "needs-verification" | "placeholder";
  imageModified: boolean;
  cropNote?: string;
  agiDefinition: string;
  predictedTimeline: string;
  predictedYear: string;
  confidenceNote: string;
  sourceTitle: string;
  sourcePublisher: string;
  sourceUrl: string;
  sourceStatus: "verified" | "needs-verification" | "placeholder";
  sigakView: string;
};

type ChronicleEra = {
  id: string;
  title: string;
  period: string;
  summary: string;
  sigakView: string;
  milestoneIds: string[];
};

type ChronicleSource = {
  title: string;
  publisher: string;
  url: string;
  note: string;
  status: "verified" | "needs-verification" | "placeholder";
};

type ChronicleImageStatus = "verified" | "needs-verification" | "placeholder";
type ChronicleImageType = "person" | "event" | "concept" | "placeholder";

type ChronicleMilestone = {
  id: string;
  year: string;
  title: string;
  era: string;
  category: string;
  summary: string;
  whatHappened: string;
  whyImportant: string;
  sigakView: string;
  nextFlow: string;
  remainingQuestion: string;
  people: string[];
  organizations: string[];
  tags: string[];
  relatedIds: string[];
  sourceStatus: "verified" | "needs-verification" | "placeholder";
  sources: ChronicleSource[];
  image: string;
  imageAlt: string;
  imageType: ChronicleImageType;
  imageCredit: string;
  imageAuthor: string;
  imageSourceTitle: string;
  imageLicense: string;
  imageSourceUrl: string;
  imageStatus: ChronicleImageStatus;
  imageModified: boolean;
  cropNote?: string;
};

type AiChronicle = {
  eras: ChronicleEra[];
  milestones: ChronicleMilestone[];
  ctas?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
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
  perspectiveItems?: PerspectiveItem[];
  observationMetrics?: ObservationMetric[];
  scenarios?: ScenarioItem[];
  remainingQuestions?: string[];
  agiForecasts?: AgiForecast[];
  chronicle?: AiChronicle;
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
        allTopics={allTopics}
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
  allTopics,
  onBack,
  onOpenTopic,
}: {
  topic: SigakTopic;
  relatedTopics: SigakTopic[];
  allTopics: SigakTopic[];
  onBack: () => void;
  onOpenTopic: (topicId: string) => void;
}) {
  if (topic.id === "ai-history" && topic.chronicle) {
    return (
      <AiChronicleView
        topic={topic}
        allTopics={allTopics}
        onBack={onBack}
        onOpenTopic={onOpenTopic}
      />
    );
  }

  if (topic.id === "agi-timeline") {
    return (
      <AgiObservatoryView
        topic={topic}
        relatedTopics={relatedTopics}
        onBack={onBack}
        onOpenTopic={onOpenTopic}
      />
    );
  }

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

function AiChronicleView({
  topic,
  allTopics,
  onBack,
  onOpenTopic,
}: {
  topic: SigakTopic;
  allTopics: SigakTopic[];
  onBack: () => void;
  onOpenTopic: (topicId: string) => void;
}) {
  const chronicle = topic.chronicle;
  const [activeEraId, setActiveEraId] = useState(chronicle?.eras[0]?.id ?? "");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(
    chronicle?.milestones[0]?.id ?? "",
  );

  if (!chronicle) {
    return null;
  }

  const activeEra = chronicle.eras.find((era) => era.id === activeEraId) ?? chronicle.eras[0];
  const visibleMilestones = chronicle.milestones.filter(
    (milestone) => milestone.era === activeEra.id,
  );
  const selectedMilestone =
    chronicle.milestones.find((milestone) => milestone.id === selectedMilestoneId) ??
    visibleMilestones[0] ??
    chronicle.milestones[0];
  const relatedTopics = selectedMilestone.relatedIds
    .map((id) => allTopics.find((item) => item.id === id))
    .filter((item): item is SigakTopic => Boolean(item));

  const selectEra = (eraId: string) => {
    const era = chronicle.eras.find((item) => item.id === eraId);
    const firstMilestoneId = era?.milestoneIds[0];

    setActiveEraId(eraId);
    if (firstMilestoneId) {
      setSelectedMilestoneId(firstMilestoneId);
    }
  };

  return (
    <section className="sigak-mvp min-h-[calc(100vh-4rem)] w-full px-4 py-10 text-white md:px-6 md:py-14">
      <article className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-yellow-300 hover:text-yellow-200"
        >
          뒤로가기
        </button>

        <section className="mt-8 rounded-[2rem] border border-yellow-300/30 bg-zinc-950 p-5 md:p-9">
          <p className="mono text-xs tracking-[0.22em] text-yellow-300">
            SIGAK.AI / 시간 / 대표 연대기
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight md:text-8xl">
            AI 연대기
          </h1>
          <p className="mt-5 max-w-3xl text-2xl font-semibold leading-snug md:text-4xl">
            AI는 어떻게 여기까지 왔고, 어디로 향하는가?
          </p>
          <p className="mt-5 max-w-4xl whitespace-pre-line text-2xl font-semibold leading-9 text-zinc-300 md:text-4xl md:leading-tight">
            AI는 갑자기 온 것이 아니다.{`\n`}오래 쌓이다가, 어느 순간 모두의 눈앞에
            나타났다.
          </p>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-zinc-400 md:text-base">
            이 페이지는 AI 역사를 단순 연도 암기가 아니라, 지능을 만들려는 시도들이
            어떻게 누적되고 가속되어 ChatGPT, 멀티모달 AI, AI Agent, AGI 논의로
            이어졌는지 보여줍니다.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ["10", "개의 시대 구간"],
              ["20", "개의 핵심 milestone"],
              ["1", "개의 이어지는 질문"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-3xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-sm text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="mono text-xs tracking-[0.2em] text-yellow-300">ERA OVERVIEW</p>
              <h2 className="mt-2 text-3xl font-semibold">시대별로 보는 AI의 누적</h2>
            </div>
            <p className="hidden max-w-md text-sm leading-6 text-zinc-400 md:block">
              시대를 고르면 해당 구간의 milestone과 SIGAK.AI의 해석이 함께 열립니다.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {chronicle.eras.map((era, index) => {
              const isActive = era.id === activeEra.id;

              return (
                <button
                  key={era.id}
                  type="button"
                  onClick={() => selectEra(era.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-yellow-300 bg-yellow-300 text-black"
                      : "border-zinc-800 bg-zinc-950 hover:-translate-y-0.5 hover:border-yellow-300/70"
                  }`}
                >
                  <p className={`mono text-xs ${isActive ? "text-black/60" : "text-yellow-300"}`}>
                    {String(index + 1).padStart(2, "0")} / {era.period}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold leading-tight">{era.title}</h3>
                  <p className={`mt-3 text-sm leading-6 ${isActive ? "text-black/75" : "text-zinc-400"}`}>
                    {era.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
              <p className="mono text-xs tracking-[0.2em] text-yellow-300">
                {activeEra.period}
              </p>
              <h2 className="mt-3 text-3xl font-semibold">{activeEra.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{activeEra.sigakView}</p>
            </div>

            <div className="mt-4 grid gap-3">
              {visibleMilestones.map((milestone) => (
                <ChronicleMilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  selected={milestone.id === selectedMilestone.id}
                  onSelect={() => setSelectedMilestoneId(milestone.id)}
                />
              ))}
            </div>
          </div>

          <ChronicleMilestoneDetail
            milestone={selectedMilestone}
            relatedTopics={relatedTopics}
            onOpenTopic={onOpenTopic}
          />
        </section>

        {chronicle.ctas && chronicle.ctas.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-yellow-300/30 bg-yellow-300/8 p-5 md:p-7">
            <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr] md:items-end">
              <div>
                <p className="mono text-xs tracking-[0.2em] text-yellow-300">NEXT MAP</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight">
                  연대기 다음에는, 방향과 속도를 봅니다.
                </h2>
              </div>
              <p className="text-sm leading-7 text-zinc-400">
                AI 연대기는 지금까지 쌓인 흐름입니다. 다음 단계는 이 흐름이 어디로
                향하는지, 왜 최근 더 빠르게 느껴지는지 확인하는 것입니다.
              </p>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {chronicle.ctas
                .map((cta) => ({
                  ...cta,
                  topic: allTopics.find((item) => item.id === cta.id),
                }))
                .filter((cta): cta is { id: string; title: string; description: string; topic: SigakTopic } =>
                  Boolean(cta.topic),
                )
                .map((cta) => (
                  <button
                    key={cta.id}
                    type="button"
                    onClick={() => onOpenTopic(cta.id)}
                    className="rounded-2xl border border-zinc-800 bg-black p-5 text-left transition hover:-translate-y-0.5 hover:border-yellow-300/70"
                  >
                    <p className="mono text-xs tracking-[0.16em] text-yellow-300">
                      {cta.topic.axis}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold">{cta.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">{cta.description}</p>
                  </button>
                ))}
            </div>
          </section>
        )}
      </article>
    </section>
  );
}

function ChronicleMilestoneCard({
  milestone,
  selected,
  onSelect,
}: {
  milestone: ChronicleMilestone;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-yellow-300 bg-yellow-300/10"
          : "border-zinc-800 bg-black hover:border-yellow-300/70"
      }`}
    >
      <div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
        <ChronicleMilestoneImage milestone={milestone} variant="card" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="mono text-2xl font-semibold text-yellow-300">{milestone.year}</p>
            <p className="w-fit rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-500">
              {milestone.category}
            </p>
            <ChronicleImageStatusBadge status={milestone.imageStatus} compact />
          </div>
          <h3 className="mt-3 text-2xl font-semibold leading-tight group-hover:text-yellow-200">
            {milestone.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{milestone.summary}</p>
          <p className="mt-3 rounded-xl border border-yellow-300/35 bg-yellow-300/8 p-3 text-sm leading-6 text-zinc-300">
            <span className="block pb-1 font-semibold text-yellow-300">SIGAK.AI의 시각</span>
            {milestone.sigakView}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {milestone.tags.slice(0, 4).map((tag) => (
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
  );
}

function ChronicleMilestoneDetail({
  milestone,
  relatedTopics,
  onOpenTopic,
}: {
  milestone: ChronicleMilestone;
  relatedTopics: SigakTopic[];
  onOpenTopic: (topicId: string) => void;
}) {
  return (
    <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 lg:sticky lg:top-24 lg:self-start md:p-6">
      <p className="mono text-xs tracking-[0.2em] text-yellow-300">
        {milestone.year} / {milestone.category}
      </p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight">{milestone.title}</h2>
      <p className="mt-3 text-sm leading-7 text-zinc-400">{milestone.summary}</p>
      <div className="mt-3">
        <ChronicleSourceStatusBadge status={milestone.sourceStatus} />
      </div>
      <div className="mt-5">
        <ChronicleMilestoneImage milestone={milestone} variant="detail" />
        <ChronicleImageCredit milestone={milestone} />
      </div>

      <div className="mt-5 grid gap-3">
        <ChronicleDetailSection title="무슨 일이 있었나" body={milestone.whatHappened} />
        <ChronicleDetailSection title="왜 중요한가" body={milestone.whyImportant} />
        <ChronicleDetailSection title="SIGAK.AI의 시각" body={milestone.sigakView} emphasized />
        <ChronicleDetailSection title="이어지는 흐름" body={milestone.nextFlow} />
        <ChronicleDetailSection title="남는 질문" body={milestone.remainingQuestion} emphasized />
      </div>

      <div className="mt-5 border-t border-zinc-800 pt-4">
        <p className="mono text-xs tracking-[0.16em] text-zinc-500">사람 / 조직</p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {milestone.people.join(", ") || "준비 중"}
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {milestone.organizations.join(", ") || "준비 중"}
        </p>
      </div>

      {relatedTopics.length > 0 && (
        <div className="mt-5 border-t border-zinc-800 pt-4">
          <p className="mono text-xs tracking-[0.16em] text-yellow-300">관련 콘텐츠</p>
          <div className="mt-3 grid gap-2">
            {relatedTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => onOpenTopic(topic.id)}
                className="rounded-xl border border-zinc-800 bg-black p-3 text-left transition hover:border-yellow-300/70"
              >
                <p className="mono text-[11px] tracking-[0.16em] text-zinc-500">
                  {topic.axis}
                </p>
                <p className="mt-1 font-semibold">{topic.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 border-t border-zinc-800 pt-4 text-xs leading-5 text-zinc-500">
        출처 상태: 사실 확인이 필요한 v1 초안입니다. 확인되지 않은 URL은 임의로 넣지
        않았고, 공식 문서/논문/기관 발표 등으로 검증한 뒤 verified로 바꿉니다.
      </p>
      {milestone.sources.length > 0 && (
        <div className="mt-3 grid gap-2">
          {milestone.sources.map((source) => (
            <div
              key={`${source.title}-${source.publisher}`}
              className="rounded-xl border border-zinc-800 bg-black p-3 text-xs leading-5 text-zinc-500"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-zinc-400">{source.publisher}</span>
                <ChronicleSourceStatusBadge status={source.status} compact />
              </div>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block underline decoration-zinc-400 underline-offset-4"
                >
                  {source.title}
                </a>
              ) : (
                <p className="mt-1">{source.title}</p>
              )}
              <p className="mt-1">{source.note}</p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function ChronicleMilestoneImage({
  milestone,
  variant,
}: {
  milestone: ChronicleMilestone;
  variant: "card" | "detail";
}) {
  const typeLabel = {
    person: "인물",
    event: "사건",
    concept: "개념",
    placeholder: "이미지 대기",
  } satisfies Record<ChronicleImageType, string>;
  const isDetail = variant === "detail";
  const isPersonImage = milestone.imageType === "person";
  const baseClass = isDetail
    ? isPersonImage
      ? "h-40 w-40 rounded-3xl"
      : "aspect-[16/9] w-full rounded-2xl"
    : "h-24 w-full rounded-2xl sm:h-24 sm:w-24";

  if (milestone.image && milestone.imageStatus === "verified") {
    return (
      <figure className={`${baseClass} overflow-hidden border border-zinc-800 bg-zinc-950`}>
        <img
          src={milestone.image}
          alt={milestone.imageAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </figure>
    );
  }

  return (
    <div
      className={`${baseClass} flex items-center justify-center border border-dashed border-zinc-800 bg-zinc-950 text-center`}
      aria-label={`${milestone.title} 이미지 placeholder`}
    >
      <div className="px-3">
        <p className="mono text-lg font-semibold text-yellow-300">
          {milestone.year}
        </p>
        <p className="mt-1 text-xs text-zinc-500">{typeLabel[milestone.imageType]}</p>
      </div>
    </div>
  );
}

function ChronicleImageCredit({ milestone }: { milestone: ChronicleMilestone }) {
  if (milestone.imageStatus === "placeholder") {
    return (
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        이미지: placeholder. 라이선스 확인된 Wikimedia Commons 파일 URL과 credit을 넣으면
        자동 표시됩니다.
      </p>
    );
  }

  if (milestone.imageStatus === "needs-verification") {
    return (
      <p className="mt-2 text-xs leading-5 text-amber-700">
        이미지 출처 확인 필요. 라이선스가 확인되기 전까지 실제 이미지는 표시하지 않습니다.
      </p>
    );
  }

  return (
    <p className="mt-2 text-xs leading-5 text-zinc-500">
      이미지:{" "}
      {milestone.imageSourceUrl ? (
        <a
          href={milestone.imageSourceUrl}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-zinc-400 underline-offset-4"
        >
          {milestone.imageCredit}
        </a>
      ) : (
        milestone.imageCredit
      )}
      {milestone.imageLicense && ` / ${milestone.imageLicense}`}
      {milestone.imageModified ? " / cropped or display-cropped" : " / unmodified"}
      {milestone.cropNote && (
        <span className="block pt-1 text-zinc-500">{milestone.cropNote}</span>
      )}
    </p>
  );
}

function ChronicleImageStatusBadge({
  status,
  compact = false,
}: {
  status: ChronicleImageStatus;
  compact?: boolean;
}) {
  const statusMap = {
    verified: {
      label: "이미지 확인",
      className: "border-teal-300 bg-teal-50 text-teal-800",
    },
    "needs-verification": {
      label: "이미지 확인 필요",
      className: "border-amber-300 bg-amber-50 text-amber-700",
    },
    placeholder: {
      label: "이미지 대기",
      className: "border-zinc-200 bg-zinc-50 text-zinc-600",
    },
  } satisfies Record<ChronicleImageStatus, { label: string; className: string }>;
  const badge = statusMap[status];

  return (
    <span
      className={`inline-flex w-fit rounded-full border ${compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"} ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

function ChronicleSourceStatusBadge({
  status,
  compact = false,
}: {
  status: ChronicleMilestone["sourceStatus"] | ChronicleSource["status"];
  compact?: boolean;
}) {
  const statusMap = {
    verified: {
      label: "출처 확인",
      className: "border-teal-300 bg-teal-50 text-teal-800",
    },
    "needs-verification": {
      label: "출처 확인 필요",
      className: "border-amber-300 bg-amber-50 text-amber-700",
    },
    placeholder: {
      label: "출처 대기",
      className: "border-zinc-200 bg-zinc-50 text-zinc-600",
    },
  } satisfies Record<ChronicleSource["status"], { label: string; className: string }>;

  const badge = statusMap[status];

  return (
    <span
      className={`inline-flex w-fit rounded-full border ${compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"} ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

function ChronicleDetailSection({
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
      className={`rounded-2xl border p-4 ${
        emphasized ? "border-yellow-300/35 bg-yellow-300/8" : "border-zinc-800 bg-black"
      }`}
    >
      <h3 className="text-sm font-semibold text-yellow-300">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-zinc-300">{body}</p>
    </section>
  );
}

function AgiObservatoryView({
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
  const definitionReasons = [
    {
      title: "능력 기준",
      body: "어떤 사람은 언어, 추론, 도구 사용처럼 해결 가능한 작업의 폭을 본다.",
    },
    {
      title: "경제적 영향",
      body: "어떤 관점은 인간 노동과 산업 구조에 미치는 파급력을 AGI의 기준으로 본다.",
    },
    {
      title: "자율성",
      body: "AI가 사람의 지시 없이 목표를 나누고 실행할 수 있는지를 중요하게 본다.",
    },
    {
      title: "위험 인식",
      body: "강력한 AI가 통제 가능한지, 사회가 감당 가능한지가 정의에 영향을 준다.",
    },
  ];

  return (
    <section className="sigak-mvp min-h-[calc(100vh-4rem)] w-full px-4 py-10 text-white md:px-6 md:py-14">
      <article className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-yellow-300 hover:text-yellow-200"
        >
          뒤로가기
        </button>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-yellow-300/30 bg-zinc-950">
          <div className="grid gap-8 p-5 md:grid-cols-[1.1fr_0.9fr] md:p-9">
            <div>
              <p className="mono text-xs tracking-[0.22em] text-yellow-300">
                SIGAK.AI / 시간 / 대표 관측소
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-7xl">
                {topic.title}
              </h1>
              <p className="mt-5 max-w-3xl text-2xl font-semibold leading-snug text-white md:text-4xl">
                AGI는 어느 날 도착하는 사건일까, 이미 통과 중인 과정일까?
              </p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
                {topic.summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {topic.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-yellow-300/25 bg-yellow-300/10 px-2.5 py-1 text-xs text-yellow-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black p-5">
              <p className="mono text-xs tracking-[0.2em] text-yellow-300">관측 프레임</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {["정의의 차이", "능력 확장", "관측 지표", "가능한 시나리오"].map(
                  (item, index) => (
                    <div key={item} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="mono text-xs text-zinc-500">0{index + 1}</p>
                      <p className="mt-3 text-lg font-semibold text-white">{item}</p>
                    </div>
                  ),
                )}
              </div>
              <p className="mt-5 border-t border-zinc-800 pt-5 text-sm leading-7 text-zinc-400">
                이 페이지는 AGI의 날짜를 예언하지 않습니다. 대신 AI가 어떤 능력을
                획득하고 있는지, 무엇을 관측해야 하는지 보여줍니다.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <DetailSection title="AGI란 무엇인가" body={topic.sections.what} />
          <DetailSection
            title="왜 중요한가"
            body={topic.sections.why}
            emphasized
          />
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
          <p className="mono text-xs tracking-[0.2em] text-yellow-300">
            왜 AGI 정의는 사람마다 다른가
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">
            AGI는 기술 용어이면서, 세계관의 차이를 드러내는 단어입니다.
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {definitionReasons.map((reason) => (
              <div key={reason.title} className="rounded-2xl border border-zinc-800 bg-black p-4">
                <h3 className="text-lg font-semibold text-yellow-100">{reason.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{reason.body}</p>
              </div>
            ))}
          </div>
        </section>

        {topic.perspectiveItems && topic.perspectiveItems.length > 0 && (
          <PerspectiveSpectrum items={topic.perspectiveItems} />
        )}

        {topic.agiForecasts && topic.agiForecasts.length > 0 && (
          <AgiForecastMap items={topic.agiForecasts} />
        )}

        {topic.timelineItems && topic.timelineItems.length > 0 && (
          <CapabilityTimeline items={topic.timelineItems} />
        )}

        {topic.observationMetrics && topic.observationMetrics.length > 0 && (
          <ObservationMetrics items={topic.observationMetrics} />
        )}

        {topic.scenarios && topic.scenarios.length > 0 && (
          <ScenarioGrid items={topic.scenarios} />
        )}

        <section className="mt-8 rounded-[2rem] border border-yellow-300/35 bg-yellow-300/10 p-5 md:p-8">
          <p className="mono text-xs tracking-[0.2em] text-yellow-300">SIGAK.AI의 시각</p>
          <p className="mt-4 whitespace-pre-line text-xl font-semibold leading-9 text-white md:text-2xl">
            {topic.sections.sigak}
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
          <p className="mono text-xs tracking-[0.2em] text-yellow-300">남는 질문</p>
          <div className="mt-5 grid gap-3">
            {(topic.remainingQuestions ?? [topic.sections.question]).map((question) => (
              <p
                key={question}
                className="rounded-2xl border border-zinc-800 bg-black p-4 text-base leading-7 text-zinc-200"
              >
                {question}
              </p>
            ))}
          </div>
        </section>

        {relatedTopics.length > 0 && (
          <RelatedContentBlock relatedTopics={relatedTopics} onOpenTopic={onOpenTopic} />
        )}
      </article>
    </section>
  );
}

function AgiForecastMap({ items }: { items: AgiForecast[] }) {
  return (
    <section className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
      <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr] md:items-end">
        <div>
          <p className="mono text-xs tracking-[0.2em] text-yellow-300">AGI 전망 지도</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
            누가 AGI를 어떻게 보고 있는가
          </h2>
        </div>
        <p className="text-sm leading-7 text-zinc-400">
          AGI라는 단어는 하나지만, 사람마다 보고 있는 기준은 다릅니다. 어떤 사람은
          경제적 가치와 자율성을 보고, 어떤 사람은 과학 발견 능력을 보고, 어떤 사람은
          현재 접근의 한계를 봅니다. 그래서 AGI 관측소는 날짜보다 먼저 “누가 무엇을
          AGI라고 부르는가”를 봅니다.
        </p>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-zinc-800 bg-black p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <ForecastImage forecast={item} />
                <div className="min-w-0">
                  <p className="mono text-[11px] tracking-[0.16em] text-yellow-300">
                    {item.organization}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight text-white">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{item.role}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <ImageStatusBadge status={item.imageStatus} />
                <SourceStatusBadge status={item.sourceStatus} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <p className="mono text-[11px] tracking-[0.16em] text-zinc-500">예상 시점</p>
                <p className="mt-2 text-xl font-semibold text-yellow-100">
                  {item.predictedYear}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {item.predictedTimeline}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <p className="mono text-[11px] tracking-[0.16em] text-zinc-500">AGI 정의</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.agiDefinition}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-yellow-300/25 bg-yellow-300/8 p-3">
              <p className="mono text-[11px] tracking-[0.16em] text-yellow-300">
                SIGAK.AI의 시각
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-200">{item.sigakView}</p>
            </div>

            <div className="mt-4 border-t border-zinc-800 pt-4">
              <p className="text-xs leading-5 text-zinc-500">{item.confidenceNote}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span>{item.sourcePublisher}</span>
                <span className="text-zinc-700">/</span>
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-300 underline decoration-zinc-600 underline-offset-4 transition hover:text-yellow-200"
                  >
                    {item.sourceTitle}
                  </a>
                ) : (
                  <span>{item.sourceTitle}</span>
                )}
              </div>
              <ImageCredit forecast={item} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ForecastImage({ forecast }: { forecast: AgiForecast }) {
  if (forecast.image && forecast.imageStatus === "verified") {
    return (
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-sm sm:h-24 sm:w-24">
        <img
          src={forecast.image}
          alt={forecast.imageAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-xl font-semibold text-yellow-300 shadow-sm sm:h-24 sm:w-24">
      {getForecastInitials(forecast.name)}
    </div>
  );
}

function getForecastInitials(name: string) {
  if (name === "Google DeepMind / Levels of AGI") {
    return "DM";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ImageCredit({ forecast }: { forecast: AgiForecast }) {
  if (forecast.imageStatus === "placeholder") {
    return (
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        이미지: placeholder. 라이선스 확인된 이미지 URL과 credit을 넣으면 자동 표시됩니다.
      </p>
    );
  }

  if (forecast.imageStatus === "needs-verification") {
    return (
      <p className="mt-3 text-xs leading-5 text-amber-700">
        이미지 출처 확인 필요. 라이선스가 확인되기 전까지 실제 이미지는 표시하지 않습니다.
      </p>
    );
  }

  return (
    <p className="mt-3 text-xs leading-5 text-zinc-500">
      이미지:{" "}
      {forecast.imageSourceUrl ? (
        <a
          href={forecast.imageSourceUrl}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-zinc-400 underline-offset-4"
        >
          {forecast.imageCredit}
        </a>
      ) : (
        forecast.imageCredit
      )}
      {forecast.imageLicense && ` / ${forecast.imageLicense}`}
      {forecast.imageModified ? " / modified" : " / unmodified"}
      {forecast.cropNote && (
        <span className="block pt-1 text-zinc-500">{forecast.cropNote}</span>
      )}
    </p>
  );
}

function ImageStatusBadge({ status }: { status: AgiForecast["imageStatus"] }) {
  const statusMap = {
    verified: {
      label: "이미지 확인",
      className: "border-teal-300 bg-teal-50 text-teal-800",
    },
    "needs-verification": {
      label: "이미지 확인 필요",
      className: "border-amber-300 bg-amber-50 text-amber-700",
    },
    placeholder: {
      label: "이미지 없음",
      className: "border-zinc-200 bg-zinc-50 text-zinc-600",
    },
  } satisfies Record<AgiForecast["imageStatus"], { label: string; className: string }>;

  const badge = statusMap[status];

  return (
    <span className={`w-fit rounded-full border px-3 py-1 text-xs ${badge.className}`}>
      {badge.label}
    </span>
  );
}

function SourceStatusBadge({ status }: { status: AgiForecast["sourceStatus"] }) {
  const statusMap = {
    verified: {
      label: "출처 확인",
      className: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
    },
    "needs-verification": {
      label: "확인 필요",
      className: "border-amber-300 bg-amber-50 text-amber-700",
    },
    placeholder: {
      label: "임시 데이터",
      className: "border-zinc-600 bg-zinc-900 text-zinc-300",
    },
  } satisfies Record<AgiForecast["sourceStatus"], { label: string; className: string }>;

  const badge = statusMap[status];

  return (
    <span className={`w-fit rounded-full border px-3 py-1 text-xs ${badge.className}`}>
      {badge.label}
    </span>
  );
}

function PerspectiveSpectrum({ items }: { items: PerspectiveItem[] }) {
  return (
    <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono text-xs tracking-[0.2em] text-yellow-300">AGI 관점 스펙트럼</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">
            같은 AGI라도, 무엇을 기준으로 보느냐에 따라 다른 단어가 됩니다.
          </h2>
        </div>
        <p className="max-w-sm text-xs leading-6 text-zinc-500">
          아래 내용은 관점 초안입니다. 확인되지 않은 발언을 사실처럼 단정하지 않기 위해
          출처 확인 메모를 함께 둡니다.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {items.map((item) => (
          <article key={item.name} className="rounded-2xl border border-zinc-800 bg-black p-4">
            <p className="mono text-[11px] tracking-[0.16em] text-zinc-500">{item.focus}</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{item.name}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{item.reading}</p>
            <p className="mt-4 border-t border-zinc-800 pt-3 text-xs leading-5 text-zinc-500">
              {item.sourceNote}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CapabilityTimeline({ items }: { items: TopicTimelineItem[] }) {
  return (
    <section className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
      <p className="mono text-xs tracking-[0.2em] text-yellow-300">능력 확장 타임라인</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight">
        단순 연표가 아니라, AI가 어떤 능력을 획득해왔는지를 봅니다.
      </h2>
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
        {items.map((item, index) => (
          <div
            key={`${item.year}-${item.label}`}
            className={`grid gap-3 border-zinc-800 bg-black p-4 md:grid-cols-[90px_180px_minmax(0,1fr)] md:p-5 ${
              index === items.length - 1 ? "" : "border-b"
            }`}
          >
            <p className="mono text-lg text-yellow-300">{item.year}</p>
            <div>
              <p className="font-semibold text-white">{item.label}</p>
              {item.ability && (
                <p className="mt-1 text-sm text-yellow-100">{item.ability}</p>
              )}
            </div>
            <p className="text-sm leading-7 text-zinc-400">{item.description ?? item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ObservationMetrics({ items }: { items: ObservationMetric[] }) {
  return (
    <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
      <p className="mono text-xs tracking-[0.2em] text-yellow-300">현재 관측 지표</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight">
        AGI를 날짜로만 보지 않고, 넓어지는 능력으로 관측합니다.
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <article key={item.title} className="rounded-2xl border border-zinc-800 bg-black p-4">
            <div className="mb-4 h-1.5 rounded-full bg-zinc-800">
              <div className="h-1.5 w-2/3 rounded-full bg-yellow-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ScenarioGrid({ items }: { items: ScenarioItem[] }) {
  return (
    <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
      <p className="mono text-xs tracking-[0.2em] text-yellow-300">가능한 시나리오</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {items.map((item, index) => (
          <article key={item.title} className="rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="mono text-xs text-yellow-300">SCENARIO 0{index + 1}</p>
            <h3 className="mt-4 text-2xl font-semibold leading-tight text-white">
              {item.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RelatedContentBlock({
  relatedTopics,
  onOpenTopic,
}: {
  relatedTopics: SigakTopic[];
  onOpenTopic: (topicId: string) => void;
}) {
  return (
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
