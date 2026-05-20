"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatGptTimeline } from "./timeline/chatgpt-timeline";

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

type TopicSource = {
  title: string;
  publisher: string;
  url: string;
  note: string;
  status: "verified" | "needs-verification" | "placeholder";
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
type ChronicleImageType =
  | "person"
  | "person-context"
  | "real-event-photo"
  | "archival-document"
  | "product-interface"
  | "concept-graphic"
  | "placeholder";
type ChronicleVisualFallbackType =
  | "timeline-card"
  | "person-event-card"
  | "paper-card"
  | "ui-card"
  | "concept-icon"
  | "abstract-graphic";

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
  visualFallbackType?: ChronicleVisualFallbackType;
  visualLabel?: string;
  visualDescription?: string;
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
  sourceStatus?: "verified" | "needs-verification" | "placeholder";
  sources?: TopicSource[];
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
          {["시간의 흐름", "인물과 관점", "변화의 지도", "사건의 기록", "남는 질문"].map((item) => (
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
        AI의 과거, 현재, 미래를 연결하고 중요한 인물과 사건과 개념을
        SIGAK.AI의 시각으로 해석합니다. 목표는 정보를 많이 아는 것이 아니라,
        이 변화가 어디서 왔고 어디로 향하는지 감을 잡는 것입니다.
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
          SIGAK.AI는 5개의 축으로 AI 시대를 읽습니다.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
          시간은 흐름, 사람은 관점, 지도는 변화, 기록은 근거, 시각은 질문입니다.
          하나의 축을 고르면 그 아래 콘텐츠 화면으로 들어갑니다.
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

function getAxisGuide(axisId: string) {
  const guides: Record<string, string> = {
    time: "추천 흐름: AI 연대기 → 기하급수적 변화 vs 선형적 사고 → AGI 관측소",
    people: "인물은 기술의 얼굴입니다. 사람을 따라가면 AI 시대의 선택과 긴장이 보입니다.",
    map: "지도 축은 AI가 일, 공부, 창작, 산업을 어떻게 바꾸는지 보는 곳입니다.",
    archive: "기록 축은 나중에 해석의 근거가 될 사건과 발언을 쌓는 곳입니다.",
    view: "시각 축은 정보보다 질문을 남기는 곳입니다.",
  };

  return guides[axisId] ?? "";
}

function AxisTopicGateway({
  axis,
  onOpenTopic,
}: {
  axis: SigakAxis;
  onOpenTopic: (topicId: string) => void;
}) {
  const axisGuide = getAxisGuide(axis.id);

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
          {axisGuide ? (
            <p className="mt-4 rounded-2xl border border-yellow-300/25 bg-yellow-300/8 p-4 text-xs leading-6 text-zinc-400">
              {axisGuide}
            </p>
          ) : null}
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
                  <p className="mt-4 inline-flex text-xs font-semibold text-yellow-300 sm:hidden">
                    콘텐츠 화면 열기 →
                  </p>
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

  if (topic.id === "exponential-vs-linear") {
    return (
      <ExponentialThinkingView
        topic={topic}
        relatedTopics={relatedTopics}
        onBack={onBack}
        onOpenTopic={onOpenTopic}
      />
    );
  }

  if (topic.id === "ai-speed-experience") {
    return (
      <AiSpeedExperienceView
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

function AiSpeedExperienceView({
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
  const developmentAreas = [
    {
      title: "ChatGPT 발전",
      status: "구현됨",
      description: "대화형 AI가 에이전트형 모델로 넓어지는 흐름",
      active: true,
    },
    {
      title: "이미지 발전",
      status: "준비 중",
      description: "텍스트에서 고품질 이미지 생성으로 확장되는 흐름",
      active: false,
    },
    {
      title: "영상 발전",
      status: "준비 중",
      description: "이미지를 넘어 시간과 장면을 생성하는 흐름",
      active: false,
    },
    {
      title: "코딩 발전",
      status: "준비 중",
      description: "자동완성에서 에이전트형 개발로 이동하는 흐름",
      active: false,
    },
  ];

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
            SIGAK.AI / 시간 / 발전속도 체험
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-7xl">
            AI 발전속도 체험
          </h1>
          <p className="mt-5 max-w-3xl text-2xl font-semibold leading-snug md:text-4xl">
            몇 년 사이, AI는 얼마나 달라졌을까?
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
            AI의 발전은 뉴스로 보면 흩어져 보이지만, 시간순으로 보면 속도가 보입니다.
          </p>
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
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mono text-xs tracking-[0.2em] text-yellow-300">발전 영역 선택</p>
              <h2 className="mt-2 text-3xl font-semibold">어떤 변화의 속도를 볼까?</h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-zinc-400">
              지금은 ChatGPT 발전을 먼저 구현했습니다. 이미지, 영상, 코딩 발전은 같은 구조로 확장합니다.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {developmentAreas.map((area) => (
              <article
                key={area.title}
                className={`rounded-2xl border p-4 ${
                  area.active
                    ? "border-yellow-300 bg-yellow-300/10"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{area.title}</h3>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      area.active
                        ? "border-yellow-300/70 text-yellow-300"
                        : "border-zinc-800 text-zinc-500"
                    }`}
                  >
                    {area.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{area.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <p className="mono text-xs tracking-[0.2em] text-yellow-300">ChatGPT 발전</p>
            <h2 className="mt-2 text-3xl font-semibold">대화형 AI의 속도</h2>
          </div>
          <ChatGptTimeline />
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <DetailSection
            title="SIGAK.AI의 시각"
            body={
              "ChatGPT의 발전은 단순한 모델 업데이트의 기록이 아니다.\n대화형 AI가 텍스트 답변 도구에서 멀티모달, 음성, 에이전트, 컴퓨터 조작 능력으로 확장되어 온 흐름이다."
            }
            emphasized
            wide
          />
          <DetailSection
            title="남는 질문"
            body="대화형 AI가 도구를 넘어 작업을 수행하는 에이전트가 된다면, 인간은 무엇을 맡게 될까?"
            emphasized
          />
        </section>

        {relatedTopics.length > 0 && (
          <RelatedContentBlock relatedTopics={relatedTopics} onOpenTopic={onOpenTopic} />
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

        <ChronicleEraRail
          eras={chronicle.eras}
          activeEraId={activeEra.id}
          onSelectEra={selectEra}
        />

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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mono text-xs tracking-[0.2em] text-yellow-300">
                    {activeEra.period}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold">{activeEra.title}</h2>
                </div>
                <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500">
                  {visibleMilestones.length} milestones
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-zinc-400">{activeEra.summary}</p>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{activeEra.sigakView}</p>
            </div>

            <div className="relative mt-4 grid gap-3 pl-3 before:absolute before:left-0 before:top-3 before:h-[calc(100%-1.5rem)] before:w-px before:bg-teal-200">
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

function ChronicleEraRail({
  eras,
  activeEraId,
  onSelectEra,
}: {
  eras: ChronicleEra[];
  activeEraId: string;
  onSelectEra: (eraId: string) => void;
}) {
  return (
    <section className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mono text-xs tracking-[0.2em] text-yellow-300">CHRONOLOGY RAIL</p>
          <h2 className="mt-2 text-2xl font-semibold">한 줄로 보는 AI 시대 구간</h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-zinc-400">
          과거에서 미래로 이동하며, 각 era가 다음 질문으로 어떻게 이어지는지 확인합니다.
        </p>
      </div>

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="grid min-w-[880px] grid-cols-10 gap-2">
          {eras.map((era, index) => {
            const isActive = era.id === activeEraId;

            return (
              <button
                key={era.id}
                type="button"
                onClick={() => onSelectEra(era.id)}
                className={`group relative rounded-2xl border p-3 text-left transition ${
                  isActive
                    ? "border-yellow-300 bg-yellow-300 text-black"
                    : "border-zinc-800 bg-black hover:border-yellow-300/70"
                }`}
              >
                <span
                  className={`absolute -top-2 left-3 h-3 w-3 rounded-full border ${
                    isActive ? "border-black bg-black" : "border-teal-300 bg-teal-100"
                  }`}
                />
                <p className={`mono text-[10px] ${isActive ? "text-black/60" : "text-yellow-300"}`}>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-xs font-semibold leading-4">{era.title}</p>
                <p className={`mt-2 mono text-[10px] ${isActive ? "text-black/60" : "text-zinc-500"}`}>
                  {era.period}
                </p>
              </button>
            );
          })}
        </div>
      </div>
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
          <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-500 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-zinc-400">인물</span>{" "}
              {milestone.people.slice(0, 2).join(", ") || "준비 중"}
            </p>
            <p>
              <span className="font-semibold text-zinc-400">조직</span>{" "}
              {milestone.organizations.slice(0, 2).join(", ") || "준비 중"}
            </p>
          </div>
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
    "person-context": "인물 맥락",
    "real-event-photo": "실제 사건",
    "archival-document": "기록 문서",
    "product-interface": "인터페이스",
    "concept-graphic": "개념 그래픽",
    placeholder: "이미지 대기",
  } satisfies Record<ChronicleImageType, string>;
  const isDetail = variant === "detail";
  const isPersonImage = milestone.imageType === "person" || milestone.imageType === "person-context";
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
      className={`${baseClass} overflow-hidden border border-zinc-800 bg-zinc-950 text-center`}
      aria-label={`${milestone.title} fallback visual`}
    >
      <ChronicleFallbackVisual
        milestone={milestone}
        imageTypeLabel={typeLabel[milestone.imageType]}
        compact={!isDetail}
      />
    </div>
  );
}

function ChronicleFallbackVisual({
  milestone,
  imageTypeLabel,
  compact,
}: {
  milestone: ChronicleMilestone;
  imageTypeLabel: string;
  compact: boolean;
}) {
  const fallbackType = milestone.visualFallbackType ?? "abstract-graphic";
  const label = milestone.visualLabel || milestone.title;
  const description = milestone.visualDescription;
  const year = milestone.year;
  const innerPadding = compact ? "p-3" : "p-5";

  if (fallbackType === "person-event-card") {
    const initials = milestone.people[0]
      ? milestone.people[0]
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
      : year.slice(0, 2);

    return (
      <div className={`flex h-full w-full flex-col justify-between bg-gradient-to-br from-teal-50 via-white to-amber-50 ${innerPadding}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-200 bg-white text-sm font-semibold text-teal-800 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 text-left">
            <p className="mono text-[10px] tracking-[0.18em] text-teal-700">{year}</p>
            <p className="truncate text-xs font-semibold text-zinc-800">{milestone.people[0] || imageTypeLabel}</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-xs font-semibold leading-4 text-zinc-800">{label}</p>
          {description && !compact ? (
            <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (fallbackType === "paper-card") {
    return (
      <div className={`h-full w-full bg-gradient-to-br from-white to-teal-50 ${innerPadding}`}>
        <div className="flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
          <div>
            <p className="mono text-[10px] tracking-[0.18em] text-teal-700">{year}</p>
            <div className="mt-3 space-y-1.5">
              <span className="block h-1.5 w-10/12 rounded-full bg-zinc-800" />
              <span className="block h-1.5 w-8/12 rounded-full bg-zinc-300" />
              <span className="block h-1.5 w-11/12 rounded-full bg-zinc-200" />
            </div>
          </div>
          <div className="mt-3 text-left">
            <p className="text-xs font-semibold leading-4 text-zinc-700">{label}</p>
            {description && !compact ? (
              <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (fallbackType === "ui-card") {
    return (
      <div className={`h-full w-full bg-gradient-to-br from-teal-50 via-white to-zinc-100 ${innerPadding}`}>
        <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex gap-1 border-b border-zinc-200 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-red-300" />
            <span className="h-2 w-2 rounded-full bg-yellow-300" />
            <span className="h-2 w-2 rounded-full bg-teal-300" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2 p-3 text-left">
            <p className="mono text-[10px] tracking-[0.18em] text-teal-700">{year}</p>
            <p className="text-xs font-semibold leading-4 text-zinc-800">{label}</p>
            {description && !compact ? (
              <p className="text-xs leading-5 text-zinc-500">{description}</p>
            ) : null}
            <span className="mt-1 h-2 rounded-full bg-teal-100" />
            <span className="h-2 w-8/12 rounded-full bg-zinc-100" />
          </div>
        </div>
      </div>
    );
  }

  if (fallbackType === "timeline-card") {
    return (
      <div className={`relative h-full w-full bg-gradient-to-br from-zinc-950 to-teal-900 ${innerPadding}`}>
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-teal-200/40" />
        <div className="relative flex h-full flex-col justify-between">
          <span className="h-3 w-3 rounded-full border border-teal-100 bg-teal-300 shadow-[0_0_28px_rgba(45,212,191,0.55)]" />
          <div className="self-center rounded-full border border-white/15 bg-white/10 px-3 py-1">
            <p className="mono text-xs font-semibold text-white">{year}</p>
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold leading-4 text-white">{label}</p>
            {description && !compact ? (
              <p className="mt-2 text-xs leading-5 text-white/65">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (fallbackType === "concept-icon") {
    return (
      <div className={`flex h-full w-full flex-col justify-between bg-gradient-to-br from-teal-50 to-white ${innerPadding}`}>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, index) => (
            <span
              key={index}
              className={`aspect-square rounded-full ${
                index === 4 ? "bg-teal-500" : "bg-teal-100"
              }`}
            />
          ))}
        </div>
        <div className="text-left">
          <p className="mono text-[10px] tracking-[0.18em] text-teal-700">{imageTypeLabel}</p>
          <p className="mt-1 text-xs font-semibold leading-4 text-zinc-800">{label}</p>
          {description && !compact ? (
            <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50 ${innerPadding}`}>
      <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-teal-200/70" />
      <div className="absolute bottom-6 right-6 h-10 w-10 rounded-full border border-teal-500/40" />
      <div className="absolute left-4 top-4 h-12 w-12 rounded-2xl bg-zinc-900" />
      <div className="relative text-left">
        <p className="mono text-[10px] tracking-[0.18em] text-teal-700">{year}</p>
        <p className="mt-1 text-xs font-semibold leading-4 text-zinc-800">{label}</p>
        {description && !compact ? (
          <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function ChronicleImageCredit({ milestone }: { milestone: ChronicleMilestone }) {
  if (milestone.imageStatus === "placeholder") {
    return (
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        이미지: 외부 이미지를 쓰지 않고 SIGAK.AI가 직접 만든 {milestone.visualFallbackType ?? "abstract-graphic"} fallback visual을 표시합니다.
        라이선스 확인된 Wikimedia Commons 파일 URL과 credit을 넣으면 실제 이미지로 교체할 수 있습니다.
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
      label: "직접 비주얼",
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
      <div className="max-w-2xl">
        <p className="mono text-xs tracking-[0.2em] text-yellow-300">관련 콘텐츠</p>
        <h2 className="mt-3 text-2xl font-semibold">다음 질문으로 이어서 보기</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          이 콘텐츠는 단독 글이 아니라 다른 사건, 인물, 개념으로 이어지는 입구입니다.
        </p>
      </div>
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
            <p className="mt-4 text-xs font-semibold text-yellow-300">이어 보기 →</p>
          </button>
        ))}
      </div>
    </section>
  );
}

const EARTH_CIRCUMFERENCE_KM = 40075;
const THIRTY_STEP_TOTAL_METERS = 2 ** 30 - 1;

const predictionOptions = [
  "운동장 한 바퀴",
  "서울에서 부산",
  "지구 한 바퀴",
  "달까지",
  "지구 26바퀴",
];

const aiAccelerationMilestones = [
  {
    year: "1950",
    title: "Turing Test",
    ability: "지능 판단의 질문",
    sigak: "기계가 생각하는가보다, 우리가 무엇을 지능으로 인정하는가를 물었다.",
  },
  {
    year: "2012",
    title: "AlexNet",
    ability: "인식",
    sigak: "데이터와 GPU와 신경망이 맞물리며 딥러닝이 다시 중심으로 올라왔다.",
  },
  {
    year: "2016",
    title: "AlphaGo",
    ability: "인간 직관 바깥의 탐색",
    sigak: "AI가 인간의 경험을 모방하는 단계를 넘어, 인간이 이해하지 못한 가능성을 탐색하기 시작했다.",
  },
  {
    year: "2017",
    title: "Transformer",
    ability: "언어의 범용 구조",
    sigak: "언어가 여러 작업을 이어 붙이는 AI의 공통 인터페이스가 되기 시작했다.",
  },
  {
    year: "2022",
    title: "ChatGPT",
    ability: "대화와 생성",
    sigak: "AI가 연구실의 성능 지표를 넘어 모두가 만지는 일상 인터페이스가 됐다.",
  },
  {
    year: "2024",
    title: "Multimodal / Sora",
    ability: "보고 듣고 생성하기",
    sigak: "AI는 텍스트를 넘어 현실감 있는 이미지, 음성, 영상의 조건을 흔들기 시작했다.",
  },
  {
    year: "2025~",
    title: "AI Agent",
    ability: "도구 사용과 장기 작업",
    sigak: "AI는 답변에서 실행으로 이동하며 인간의 역할을 지시와 검증 쪽으로 밀어낸다.",
  },
  {
    year: "미래",
    title: "AGI 논의",
    ability: "범용성",
    sigak: "중요한 질문은 날짜가 아니라, 이미 넓어지는 능력을 어떤 기준으로 볼 것인가다.",
  },
];

const distanceMilestones = [5, 10, 20, 25, 30];

function ExponentialThinkingView({
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
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const currentStepMeters = getStepDistanceMeters(step);
  const cumulativeMeters = getCumulativeDistanceMeters(step);
  const cumulativeKm = cumulativeMeters / 1000;
  const earthLaps = cumulativeKm / EARTH_CIRCUMFERENCE_KM;

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

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-yellow-300/30 bg-zinc-950">
          <div className="grid gap-8 p-5 md:grid-cols-[1.05fr_0.95fr] md:p-9">
            <div>
              <p className="mono text-xs tracking-[0.22em] text-yellow-300">
                SIGAK.AI / 시간 / 체험형 페이지
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight md:text-7xl">
                기하급수적 변화 vs 선형적 사고
              </h1>
              <p className="mt-5 max-w-3xl text-2xl font-semibold leading-snug md:text-4xl">
                우리는 미래를 직선으로 상상합니다.
                <br />
                하지만 AI는 누적과 가속의 방식으로 움직입니다.
              </p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
                이 페이지는 그래프와 사고실험을 통해 인간이 왜 AI의 속도를 과소평가하는지 보여줍니다.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-black p-5">
              <p className="mono text-xs tracking-[0.2em] text-yellow-300">중심 문장</p>
              <p className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
                AI는 갑자기 온 것이 아니다.
              </p>
              <p className="mt-4 text-2xl font-semibold leading-tight text-zinc-300">
                우리가 곡선의 뒤쪽을 갑자기 보게 된 것이다.
              </p>
              <p className="mt-6 border-t border-zinc-800 pt-5 text-sm leading-7 text-zinc-500">
                여기서 기하급수는 예측 공식이 아니라, 인간의 선형 직관이 왜 자주 빗나가는지 이해하기 위한 사고실험입니다.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
          <DetailSection
            title="먼저, 왜 AI는 빠르게 느껴지는가"
            body={`AI 발전은 단순히 모델 하나가 좋아지는 일이 아닙니다.\n컴퓨트 발전, 데이터 축적, 모델 규모, 알고리즘 개선, 도구 사용, 사용자 확산이 서로 겹칩니다.\n그래서 어느 순간 변화가 갑자기 온 것처럼 느껴집니다.`}
          />
          <DetailSection
            title="SIGAK.AI의 시각"
            body="AI 시대의 속도는 하나의 기술 속도가 아니라, 여러 곡선이 겹쳐지는 속도다."
            emphasized
          />
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-4">
          <ConceptGraphCard
            eyebrow="COMPUTE"
            title="컴퓨터 발전 그래프"
            description="컴퓨터는 수십 년 동안 더 작고, 더 빠르고, 더 저렴해지는 방향으로 발전해왔다. AI는 이 계산 능력 위에서 성장했다."
            note="개념 그래프입니다. 무어의 법칙이 지금도 같은 속도로 유지된다고 단정하지 않습니다."
            curve="compute"
          />
          <ConceptGraphCard
            eyebrow="TRAINING COMPUTE"
            title="AI training compute 그래프"
            description="딥러닝 이후 notable AI systems의 학습 계산량은 이전보다 훨씬 가파른 기울기로 증가해왔다."
            note="Our World in Data와 Epoch AI의 training compute 추적을 참고한 개념 그래프입니다. 실제 데이터 차트를 복사하지 않았습니다."
            curve="training"
          />
          <ConceptGraphCard
            eyebrow="SCALING"
            title="더 많은 계산, 더 많은 데이터, 더 큰 모델"
            description="스케일링 법칙은 일정 기간 동안 계산·데이터·모델 규모가 AI 능력을 예측 가능하게 끌어올린 경향을 보여줬다."
            note="성능이 끝없이 좋아진다는 뜻은 아닙니다. 효율, 데이터 품질, 비용, 아키텍처 한계가 함께 중요합니다."
            curve="scaling"
          />
          <ConceptGraphCard
            eyebrow="AI HISTORY"
            title="AI 발전 그래프"
            description="AI 능력은 긴 침묵과 작은 개선을 거쳐, 어느 순간 대중이 체감하는 변화로 나타났다."
            note="AI 연대기의 milestone을 단순화한 개념적 흐름입니다."
            curve="ai"
          />
        </section>

        <section className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
          <div className="grid gap-4 md:grid-cols-[0.75fr_1.25fr] md:items-end">
            <div>
              <p className="mono text-xs tracking-[0.2em] text-yellow-300">스케일링 법칙을 쉽게 보기</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight">
                더 많은 계산, 더 많은 데이터, 더 큰 모델
              </h2>
            </div>
            <p className="text-sm leading-7 text-zinc-400">
              스케일링 법칙이 보여준 것은 단순히 “AI가 커졌다”가 아닙니다. 일정 기간 동안 계산, 데이터, 모델 규모가 손실 감소와 성능 향상에 예측 가능한 관계를 보였다는 점입니다.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ["Compute", "더 많은 계산은 더 큰 실험과 학습을 가능하게 했다."],
              ["Data", "더 많은 데이터는 모델이 더 넓은 패턴을 배우게 했다."],
              ["Model Size", "더 큰 모델은 더 복잡한 관계를 담을 수 있게 했다."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="mono text-xs tracking-[0.16em] text-yellow-300">{title}</p>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4 text-xs leading-6 text-zinc-500">
            주의: 성능이 끝없이 좋아진다는 뜻은 아닙니다. 데이터 품질, 비용, 효율, 아키텍처 변화, 평가 방식의 한계가 함께 중요합니다.
          </p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 md:p-7">
          <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="mono text-xs tracking-[0.2em] text-yellow-300">AI 발전 단계</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight">
                갑자기 나타난 것이 아니라, 능력이 겹겹이 쌓였습니다.
              </h2>
            </div>
            <p className="text-sm leading-7 text-zinc-400">
              아래 흐름은 정확한 성능 수치가 아니라, 사람들이 AI의 능력을 체감하게 된 주요 장면을 SIGAK.AI식으로 압축한 것입니다.
            </p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {aiAccelerationMilestones.map((item) => (
              <article key={`${item.year}-${item.title}`} className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="mono text-xs text-yellow-300">{item.year}</p>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold text-zinc-300">획득한 능력: {item.ability}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.sigak}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-yellow-300/35 bg-yellow-300/8 p-5 md:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="mono text-xs tracking-[0.2em] text-yellow-300">
                30걸음 실험
              </p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight">
                1m에서 시작해, 매 걸음마다 2배씩 커진다면?
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                먼저 예측해보세요. 그다음 한 걸음씩 진행하면, 초반에는 거의 차이가 없다가 뒤쪽 몇 걸음에서 감각이 무너집니다.
              </p>
              <div className="mt-5 grid gap-2">
                {predictionOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedPrediction(option)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      selectedPrediction === option
                        ? "border-yellow-300 bg-yellow-300 text-black"
                        : "border-zinc-800 bg-black text-zinc-300 hover:border-yellow-300/70"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mono text-xs tracking-[0.18em] text-zinc-500">현재 걸음</p>
                  <p className="mt-2 text-6xl font-semibold text-yellow-300">{step}</p>
                </div>
                <div className="text-right">
                  <p className="mono text-xs tracking-[0.18em] text-zinc-500">예측</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-300">
                    {selectedPrediction ?? "아직 선택 전"}
                  </p>
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-900">
                <div
                  className="h-full rounded-full bg-yellow-300 transition-all"
                  style={{ width: `${(step / 30) * 100}%` }}
                />
              </div>

              <StepDistanceVisualization step={step} earthLaps={earthLaps} />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <MetricBox
                  label={`${step}번째 걸음 한 번의 길이`}
                  value={formatDistance(currentStepMeters)}
                  note="이번 한 걸음만의 거리"
                />
                <MetricBox
                  label={`${step}걸음 누적 거리`}
                  value={formatDistance(cumulativeMeters)}
                  note={`지구 약 ${formatEarthLaps(earthLaps)}바퀴`}
                />
              </div>

              <p className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-7 text-zinc-300">
                {getStepInsight(step)}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStep((value) => Math.min(30, value + 1))}
                  className="rounded-full border border-yellow-300 bg-yellow-300 px-4 py-2 text-sm font-semibold text-black"
                >
                  다음 걸음
                </button>
                <button
                  type="button"
                  onClick={() => setStep((value) => Math.min(30, value + 5))}
                  className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-yellow-300/70"
                >
                  5걸음 진행
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedPrediction(null);
                  }}
                  className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-yellow-300/70"
                >
                  처음부터 다시
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
            <p className="mono text-xs tracking-[0.2em] text-yellow-300">선형적 걸음</p>
            <p className="mt-4 text-5xl font-semibold">30m</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">1m씩 30번 걸으면 누적 30m입니다. 인간의 직관은 대체로 이런 방식에 익숙합니다.</p>
            <LinearVsExponentialGraph mode="linear" />
          </div>
          <div className="rounded-3xl border border-yellow-300/35 bg-yellow-300/8 p-5 md:p-7">
            <p className="mono text-xs tracking-[0.2em] text-yellow-300">기하급수적 걸음</p>
            <p className="mt-4 text-5xl font-semibold">{formatDistance(THIRTY_STEP_TOTAL_METERS)}</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">30걸음 누적 거리는 약 1,073,742km, 지구 약 26.8바퀴입니다.</p>
            <LinearVsExponentialGraph mode="exponential" />
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
          <p className="mono text-xs tracking-[0.2em] text-yellow-300">거리 milestone</p>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {distanceMilestones.map((milestoneStep) => {
              const meters = getCumulativeDistanceMeters(milestoneStep);
              return (
                <article key={milestoneStep} className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="mono text-xs text-yellow-300">{milestoneStep}걸음</p>
                  <p className="mt-3 text-2xl font-semibold">{formatDistance(meters)}</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">{getMilestoneCopy(milestoneStep, meters)}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <DetailSection
            title="왜 사람들은 이해하지 못하는가"
            body={`인간은 어제와 오늘의 차이를 보고 내일을 예상합니다.\n하지만 누적과 가속의 변화는 초반에는 작게 보이고, 후반에는 갑자기 세상을 바꾼 것처럼 보입니다.\n문제는 AI의 속도만이 아닙니다. 문제는 인간이 그 속도를 선형적으로 상상한다는 데 있습니다.`}
          />
          <DetailSection
            title="AI와 연결"
            body={`사람들은 ChatGPT를 보고 AI가 갑자기 등장했다고 느꼈습니다.\n하지만 실제로는 컴퓨트, 데이터, 모델, 연구, 제품화가 오랫동안 쌓여온 곡선이 드디어 눈에 보이기 시작한 것입니다.\n이어지는 흐름: AI 연대기 → 기하급수적 변화 vs 선형적 사고 → AGI 관측소`}
          />
        </section>

        <section className="mt-8 rounded-[2rem] border border-yellow-300/35 bg-yellow-300/10 p-5 md:p-8">
          <p className="mono text-xs tracking-[0.2em] text-yellow-300">SIGAK.AI의 시각</p>
          <p className="mt-4 text-2xl font-semibold leading-10 md:text-3xl">
            AI 시대를 이해하려면 기술 이름보다 변화의 곡선을 먼저 봐야 한다.
            <br />
            AI는 하나의 도구가 좋아지는 사건이 아니라, 좋아진 도구가 다음 변화를 더 빠르게 만드는 과정이다.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
            <p className="mono text-xs tracking-[0.2em] text-yellow-300">남는 질문</p>
            <div className="mt-5 grid gap-3">
              {[
                "우리는 지금 곡선의 몇 번째 걸음에 서 있을까?",
                "AI의 다음 변화도 지금은 작아 보이는 중일까?",
                "인간의 준비는 직선 속도로 움직이는데, 환경은 곡선으로 바뀐다면 무엇을 해야 할까?",
              ].map((question) => (
                <p key={question} className="rounded-2xl border border-zinc-800 bg-black p-4 text-sm leading-7 text-zinc-300">
                  {question}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-7">
            <p className="mono text-xs tracking-[0.2em] text-yellow-300">출처 상태</p>
            <div className="mt-4">
              <ChronicleSourceStatusBadge status={topic.sourceStatus ?? "needs-verification"} />
            </div>
            <p className="mt-4 text-xs leading-6 text-zinc-500">
              이 페이지의 그래프는 직접 만든 개념 그래프입니다. 논문 그래프나 외부 이미지를 복제하지 않았습니다.
            </p>
            {topic.sources && topic.sources.length > 0 && (
              <div className="mt-4 grid gap-2">
                {topic.sources.map((source) => (
                  <div key={`${source.publisher}-${source.title}`} className="rounded-xl border border-zinc-800 bg-black p-3 text-xs leading-5 text-zinc-500">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-zinc-400">{source.publisher}</span>
                      <ChronicleSourceStatusBadge status={source.status} compact />
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block underline decoration-zinc-400 underline-offset-4"
                    >
                      {source.title}
                    </a>
                    <p className="mt-1">{source.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {relatedTopics.length > 0 && (
          <RelatedContentBlock relatedTopics={relatedTopics} onOpenTopic={onOpenTopic} />
        )}
      </article>
    </section>
  );
}

function ConceptGraphCard({
  eyebrow,
  title,
  description,
  note,
  curve,
}: {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  curve: "compute" | "training" | "scaling" | "ai";
}) {
  return (
    <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="mono text-xs tracking-[0.18em] text-yellow-300">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight">{title}</h2>
      <ConceptCurve curve={curve} />
      <p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p>
      <p className="mt-4 rounded-xl border border-zinc-800 bg-black p-3 text-xs leading-5 text-zinc-500">{note}</p>
    </article>
  );
}

function ConceptCurve({ curve }: { curve: "compute" | "training" | "scaling" | "ai" }) {
  const paths = {
    compute: "M12 138 C48 136 72 126 96 112 C122 96 142 78 165 52 C178 37 190 28 208 20",
    training: "M12 140 L66 136 L112 128 L145 104 L174 60 L208 18",
    scaling: "M12 136 C46 130 78 118 108 99 C139 79 161 58 188 34 C197 26 205 22 214 18",
    ai: "M12 140 L58 137 L82 130 L111 116 L137 91 L164 55 L190 30 L214 18",
  } satisfies Record<typeof curve, string>;

  return (
    <svg viewBox="0 0 226 156" className="mt-5 h-40 w-full rounded-2xl border border-zinc-800 bg-black">
      <path d="M18 12 V140 H216" fill="none" stroke="currentColor" className="text-zinc-800" strokeWidth="2" />
      <path d={paths[curve]} fill="none" stroke="currentColor" className="text-yellow-300" strokeWidth="4" strokeLinecap="round" />
      {[28, 72, 116, 160, 204].map((x) => (
        <line key={x} x1={x} y1="136" x2={x} y2="140" stroke="currentColor" className="text-zinc-700" />
      ))}
      <text x="18" y="151" className="fill-zinc-500 text-[9px]">시간</text>
      <text x="4" y="18" className="fill-zinc-500 text-[9px]">능력</text>
    </svg>
  );
}

function StepDistanceVisualization({ step, earthLaps }: { step: number; earthLaps: number }) {
  const markerX = 18 + ((step - 1) / 29) ** 2.7 * 190;
  const normalizedLapProgress = Math.min(1, earthLaps / 26.8);
  const circumference = 2 * Math.PI * 34;
  const dashOffset = circumference * (1 - normalizedLapProgress);

  return (
    <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_130px] md:items-center">
        <svg viewBox="0 0 230 96" className="h-28 w-full overflow-visible rounded-xl bg-black">
          <path d="M18 72 C68 72 104 69 136 58 C170 47 190 29 214 16" fill="none" stroke="currentColor" className="text-zinc-800" strokeWidth="3" strokeLinecap="round" />
          {[1, 5, 10, 15, 20, 25, 30].map((point) => {
            const x = 18 + ((point - 1) / 29) ** 2.7 * 190;
            const y = 72 - ((point - 1) / 29) ** 2.1 * 56;
            const isActive = point <= step;
            return (
              <g key={point}>
                <circle cx={x} cy={y} r={isActive ? 4 : 2.5} className={isActive ? "fill-yellow-300" : "fill-zinc-700"} />
                {[10, 20, 30].includes(point) && (
                  <text x={x - 8} y={y - 9} className="fill-zinc-500 text-[8px]">{point}</text>
                )}
              </g>
            );
          })}
          <circle
            cx={markerX}
            cy={72 - ((step - 1) / 29) ** 2.1 * 56}
            r="7"
            className="fill-yellow-300"
          />
          <text x="18" y="90" className="fill-zinc-500 text-[9px]">초반: 거의 평평함</text>
          <text x="142" y="90" className="fill-zinc-500 text-[9px]">후반: 화면 밖으로 튀는 감각</text>
        </svg>

        <div className="flex items-center gap-4 md:block">
          <svg viewBox="0 0 88 88" className="h-24 w-24 shrink-0">
            <circle cx="44" cy="44" r="34" fill="none" stroke="currentColor" className="text-zinc-800" strokeWidth="9" />
            <circle
              cx="44"
              cy="44"
              r="34"
              fill="none"
              stroke="currentColor"
              className="text-yellow-300"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 44 44)"
            />
            <text x="44" y="49" textAnchor="middle" className="fill-zinc-300 text-[13px] font-semibold">
              {formatEarthLaps(earthLaps)}x
            </text>
          </svg>
          <p className="text-xs leading-5 text-zinc-500 md:mt-2">
            누적 거리 기준 지구 둘레 환산입니다. 초반에는 0에 가깝다가, 후반 몇 걸음에서 숫자가 급격히 커집니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="mono text-xs tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-yellow-300">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{note}</p>
    </div>
  );
}

function LinearVsExponentialGraph({ mode }: { mode: "linear" | "exponential" }) {
  const path =
    mode === "linear"
      ? "M16 132 L214 42"
      : "M16 134 C72 132 118 126 148 100 C176 76 194 42 214 14";

  return (
    <svg viewBox="0 0 230 150" className="mt-6 h-44 w-full rounded-2xl border border-zinc-800 bg-black">
      <path d="M16 12 V134 H216" fill="none" stroke="currentColor" className="text-zinc-800" strokeWidth="2" />
      <path d={path} fill="none" stroke="currentColor" className="text-yellow-300" strokeWidth="4" strokeLinecap="round" />
      <text x="16" y="146" className="fill-zinc-500 text-[9px]">1</text>
      <text x="196" y="146" className="fill-zinc-500 text-[9px]">30</text>
    </svg>
  );
}

function getStepDistanceMeters(step: number) {
  return 2 ** (step - 1);
}

function getCumulativeDistanceMeters(step: number) {
  return 2 ** step - 1;
}

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${meters.toLocaleString("ko-KR")}m`;
  }

  const km = meters / 1000;
  return `약 ${Math.round(km).toLocaleString("ko-KR")}km`;
}

function formatEarthLaps(laps: number) {
  if (laps < 0.1) {
    return laps.toFixed(3);
  }

  if (laps < 10) {
    return laps.toFixed(1);
  }

  return laps.toFixed(1);
}

function getStepInsight(step: number) {
  if (step < 10) {
    return "아직은 별일 없어 보입니다. 기하급수적 변화가 무서운 이유는 초반에 너무 평범해 보인다는 점입니다.";
  }

  if (step < 20) {
    return "이제 차이가 느껴지기 시작합니다. 하지만 아직 대부분의 사람은 이 정도면 예측 가능한 변화라고 생각합니다.";
  }

  if (step < 25) {
    return "곡선이 뒤쪽으로 접어듭니다. 여기서부터는 어제와 오늘의 차이로 내일을 예측하기 어려워집니다.";
  }

  if (step < 30) {
    return "이제 변화는 직관을 넘어섭니다. 사람들은 이 시점이 되어서야 '갑자기'라고 느낍니다.";
  }

  return "30걸음의 누적 거리는 약 1,073,742km입니다. 답은 '지구 26바퀴'에 가깝습니다.";
}

function getMilestoneCopy(step: number, meters: number) {
  const km = meters / 1000;
  if (step === 5) return "아직 별 차이가 없어 보입니다.";
  if (step === 10) return "약 1km 수준으로 느껴지기 시작합니다.";
  if (step === 20) return `누적 약 ${Math.round(km).toLocaleString("ko-KR")}km, 이미 도시를 넘어섭니다.`;
  if (step === 25) return `누적 약 ${Math.round(km).toLocaleString("ko-KR")}km, 지구 둘레에 가까워집니다.`;
  return `누적 약 ${Math.round(km).toLocaleString("ko-KR")}km, 지구 약 ${(km / EARTH_CIRCUMFERENCE_KM).toFixed(1)}바퀴입니다.`;
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
