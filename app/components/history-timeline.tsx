"use client";

import { useState } from "react";
import HistoryEventCard from "@/app/components/history-event-card";
import type { HistoryEvent } from "@/app/components/history-timeline.types";

type HistoryTimelineProps = {
  items: HistoryEvent[];
};

type Era = {
  label: string;
  start: number;
  end: number;
};

type ViewMode = "default" | "overview";

type LayoutPreset = {
  yearUnit: number;
  baseOffset: number;
  laneTop: number;
  laneBottom: number;
  railTop: number;
  minHeight: number;
  cardWidth: {
    main: number;
    sub: number;
  };
  cardGap: {
    main: number;
    sub: number;
  };
  endPadding: number;
};

const eras: Era[] = [
  { label: "태동기", start: 1950, end: 1969 },
  { label: "암흑기 / 침체기", start: 1970, end: 1999 },
  { label: "딥러닝 부흥기", start: 2000, end: 2019 },
  { label: "생성형 AI 시대", start: 2020, end: 2026 },
];

const layoutPresets: Record<ViewMode, LayoutPreset> = {
  default: {
    yearUnit: 34,
    baseOffset: 112,
    laneTop: 112,
    laneBottom: 470,
    railTop: 392,
    minHeight: 840,
    cardWidth: { main: 220, sub: 188 },
    cardGap: { main: 248, sub: 212 },
    endPadding: 280,
  },
  overview: {
    yearUnit: 18,
    baseOffset: 52,
    laneTop: 112,
    laneBottom: 304,
    railTop: 270,
    minHeight: 460,
    cardWidth: { main: 156, sub: 136 },
    cardGap: { main: 172, sub: 146 },
    endPadding: 120,
  },
};

function buildDesktopLayout(items: HistoryEvent[], viewMode: ViewMode) {
  const sortedItems = [...items].sort((a, b) => a.year - b.year);
  const minYear = sortedItems[0]?.year ?? 1950;
  const maxYear = sortedItems[sortedItems.length - 1]?.year ?? 2026;
  const preset = layoutPresets[viewMode];
  const previousLeftByLane = { top: -1000, bottom: -1000 };

  const positionedItems = sortedItems.map((item, index) => {
    const lane = index % 2 === 0 ? "top" : "bottom";
    const width =
      item.importance === "main" ? preset.cardWidth.main : preset.cardWidth.sub;
    const baseLeft = preset.baseOffset + (item.year - minYear) * preset.yearUnit;
    const gap = item.importance === "main" ? preset.cardGap.main : preset.cardGap.sub;
    const left = Math.max(baseLeft, previousLeftByLane[lane] + gap);

    previousLeftByLane[lane] = left;

    return {
      event: item,
      lane,
      left,
      top: lane === "top" ? preset.laneTop : preset.laneBottom,
      width,
    };
  });

  const lastItem = positionedItems[positionedItems.length - 1];
  const totalWidth = lastItem
    ? lastItem.left + lastItem.width + preset.endPadding
    : preset.endPadding + 1200;

  return {
    positionedItems,
    totalWidth: Math.max(totalWidth, 1280),
    minYear,
    maxYear,
    railTop: preset.railTop,
    minHeight: preset.minHeight,
  };
}

export default function HistoryTimeline({ items }: HistoryTimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null);
  const { positionedItems, totalWidth, minYear, maxYear, railTop, minHeight } =
    buildDesktopLayout(items, viewMode);
  const allowExpand = viewMode === "default";
  const simplifiedTimelineYears = eras.map((era) => `${era.start}-${era.end}`);

  return (
    <section className="history-shell relative overflow-hidden rounded-[32px] px-4 py-5 md:px-6 md:py-7">
      <div className="history-noise absolute inset-0" />

      <div className="relative z-10 space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="history-pill mono rounded-full px-3 py-1 text-[11px] tracking-[0.24em] text-sky-700">
                AI HISTORY MVP
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                16 핵심 사건
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                {minYear} → {maxYear}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode("overview");
                  setExpandedId(null);
                }}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  viewMode === "overview"
                    ? "bg-sky-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-slate-950"
                }`}
              >
                전체 보기
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("default");
                  setExpandedId((current) => current ?? items[0]?.id ?? null);
                }}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  viewMode === "default"
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-slate-950"
                }`}
              >
                기본 보기
              </button>
            </div>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              AI의 역사
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              기계가 생각할 수 있을까?에서 대화형 AI와 에이전트까지, 인공지능의 흐름을
              핵심 사건만으로 직관적으로 정리했습니다.
            </p>
          </div>
        </div>

        <div
          className={`grid gap-5 md:items-start ${
            viewMode === "overview"
              ? "md:grid-cols-[minmax(0,1fr)]"
              : "md:grid-cols-[172px_minmax(0,1fr)]"
          }`}
        >
          {viewMode === "default" && (
            <aside className="space-y-3">
              {eras.map((era) => (
                <div
                  key={era.label}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
                >
                  <p className="mono text-[10px] tracking-[0.22em] text-sky-700/80">
                    {era.start} - {era.end}
                  </p>
                  <p className="mt-1 font-medium text-slate-900">{era.label}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-600">
                기본 보기에서는 카드 클릭 시 상세 설명과 출처가 펼쳐집니다.
              </div>
            </aside>
          )}

          <div className="space-y-5">
            {viewMode === "overview" && (
              <div className="hidden md:flex flex-wrap items-center gap-2">
                {eras.map((era) => (
                  <span
                    key={era.label}
                    className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs text-slate-600"
                  >
                    <span className="font-medium text-slate-900">{era.label}</span>{" "}
                    <span className="mono text-[11px] text-sky-700/80">
                      {era.start}-{era.end}
                    </span>
                  </span>
                ))}
              </div>
            )}

            <div className="hidden md:block">
              <div className="history-scroll overflow-x-auto pb-4">
                <div
                  className="relative rounded-[28px] border border-slate-200 bg-white"
                  style={{ width: `${totalWidth}px`, minHeight: `${minHeight}px` }}
                >
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-sky-50 to-transparent" />

                  {eras.map((era) => {
                    const left = ((era.start - minYear) / (maxYear - minYear || 1)) * 100;
                    const width =
                      ((era.end - era.start + 1) / (maxYear - minYear + 1 || 1)) * 100;

                    return (
                      <div
                        key={era.label}
                        className="absolute inset-y-0 border-r border-slate-200/80 bg-[linear-gradient(180deg,rgba(240,249,255,0.9),rgba(255,255,255,0)_26%,rgba(240,249,255,0.7)_100%)]"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <div
                          className={`absolute left-4 rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-[11px] text-slate-500 ${
                            viewMode === "overview" ? "top-3" : "top-4"
                          }`}
                        >
                          {era.label}
                        </div>
                      </div>
                    );
                  })}

                  <div
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-sky-100 via-sky-500 to-sky-100"
                    style={{ top: `${railTop}px` }}
                  />
                  <div
                    className="absolute left-0 right-0 h-7 bg-[linear-gradient(180deg,rgba(14,165,233,0.12),transparent)]"
                    style={{ top: `${railTop - 12}px` }}
                  />

                  {positionedItems.map(({ event, left, width, lane, top }) => {
                    const isExpanded = allowExpand && expandedId === event.id;
                    const yearYOffset = lane === "top" ? -2 : 4;
                    const connectorTop =
                      lane === "top"
                        ? viewMode === "overview"
                          ? 128
                          : 176
                        : -84;
                    const connectorHeight =
                      lane === "top"
                        ? Math.max(
                            railTop - top - (viewMode === "overview" ? 134 : 184),
                            40,
                          )
                        : 84;

                    return (
                      <div
                        key={event.id}
                        className="absolute"
                        style={{
                          left: `${left}px`,
                          top: `${top}px`,
                          width: `${width}px`,
                        }}
                      >
                        <div className={lane === "top" ? "mb-4" : "mb-0 mt-4"}>
                          <div
                            className="absolute left-4 w-px bg-sky-300/90"
                            style={{
                              top: `${connectorTop}px`,
                              height: `${connectorHeight}px`,
                            }}
                          />
                          <div
                            className="absolute left-[10px] h-3.5 w-3.5 rounded-full border-2 border-white bg-sky-500 shadow-[0_0_0_4px_rgba(224,242,254,0.95)]"
                            style={{ top: `${railTop - top - 6}px` }}
                          />
                          <p className="mono text-[10px] tracking-[0.24em] text-sky-700/80">
                            {event.date}
                          </p>
                          <p
                            className={`mt-1 font-semibold tracking-tight text-slate-950 ${
                              viewMode === "overview" ? "text-[2.6rem]" : "text-[3.7rem]"
                            }`}
                            style={{ transform: `translateY(${yearYOffset}px)` }}
                          >
                            {event.year}
                          </p>
                        </div>

                        <HistoryEventCard
                          event={event}
                          expanded={isExpanded}
                          layout="desktop"
                          viewMode={viewMode}
                          allowExpand={allowExpand}
                          onToggle={(id) =>
                            setExpandedId((current) => (current === id ? null : id))
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6 md:hidden">
              {eras.map((era) => {
                const eraItems = items.filter(
                  (item) => item.year >= era.start && item.year <= era.end,
                );

                if (eraItems.length === 0) {
                  return null;
                }

                return (
                  <section key={era.label} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-sky-200" />
                      <p className="mono text-xs tracking-[0.22em] text-sky-700/80">
                        {era.label}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {eraItems.map((event) => (
                        <div key={event.id} className="relative pl-5">
                          <div className="absolute left-0 top-5 h-full w-px bg-sky-200" />
                          <div className="absolute left-[-4px] top-5 h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgba(224,242,254,0.9)]" />
                          <div className="mb-2">
                            <p className="mono text-xs tracking-[0.22em] text-sky-700/80">
                              {event.date}
                            </p>
                            <p className="text-2xl font-semibold text-slate-950">{event.year}</p>
                          </div>
                          <HistoryEventCard
                            event={event}
                            expanded={expandedId === event.id}
                            layout="mobile"
                            viewMode="default"
                            allowExpand
                            onToggle={(id) =>
                              setExpandedId((current) => (current === id ? null : id))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              나중에 사건을 추가할 때는 연도순으로 데이터만 넣으면 됩니다.{" "}
              <code>importance: &quot;sub&quot;</code>를 사용하면 더 작은 카드로 확장할 수
              있도록 구조를 열어두었습니다.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500">
          <span className="mono text-[11px] tracking-[0.22em] text-sky-700/80">
            ERA GUIDE
          </span>
          {simplifiedTimelineYears.map((range, index) => (
            <span
              key={range}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1"
            >
              <span className="text-slate-700">{eras[index]?.label}</span>
              <span className="mono text-[11px] text-sky-700/75">{range}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
