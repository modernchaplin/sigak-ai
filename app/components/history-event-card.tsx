"use client";

import type { HistoryEvent } from "@/app/components/history-timeline.types";

type HistoryEventCardProps = {
  event: HistoryEvent;
  expanded: boolean;
  layout: "desktop" | "mobile";
  viewMode: "default" | "overview";
  allowExpand: boolean;
  onToggle: (id: string) => void;
};

export default function HistoryEventCard({
  event,
  expanded,
  layout,
  viewMode,
  allowExpand,
  onToggle,
}: HistoryEventCardProps) {
  const tags = event.tags.slice(0, 2);
  const isMain = event.importance === "main";
  const compact = layout === "desktop" && viewMode === "overview";

  return (
    <article
      className={`history-glass rounded-[24px] ${
        layout === "desktop" ? (compact ? "p-3.5" : isMain ? "p-[18px]" : "p-4") : "p-[18px]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`min-w-0 ${compact ? "space-y-1.5" : "space-y-3"}`}>
          {!compact && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="history-pill mono rounded-full px-2.5 py-1 text-[10px] tracking-[0.22em] text-sky-700">
                {event.date}
              </span>
              {isMain && (
                <span className="mono rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-[10px] tracking-[0.18em] text-sky-700/80">
                  MAIN
                </span>
              )}
            </div>
          )}
          <div>
            <h3
              className={`max-w-[18rem] overflow-hidden font-semibold leading-tight text-slate-950 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1] ${
                compact ? "text-[15px]" : "text-lg"
              }`}
            >
              {event.title}
            </h3>
            <p
              className={`mt-1 overflow-hidden text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1] ${
                compact ? "text-[12px] leading-[18px]" : "text-sm leading-5"
              }`}
            >
              {event.summary}
            </p>
          </div>
          {!compact && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {allowExpand && (
          <button
            type="button"
            onClick={() => onToggle(event.id)}
            aria-expanded={expanded}
            className="mono rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] tracking-[0.2em] text-slate-600 transition hover:border-sky-300 hover:text-slate-950"
          >
            {expanded ? "CLOSE" : "DETAIL"}
          </button>
        )}
      </div>

      {allowExpand && expanded && (
        <div className="mt-5 space-y-4 border-t border-slate-200 pt-4">
          <p className="text-sm leading-6 text-slate-700">{event.detail}</p>
          <div className="space-y-2">
            <p className="mono text-[11px] tracking-[0.24em] text-sky-700/80">
              SOURCES
            </p>
            <div className="flex flex-wrap gap-2">
              {event.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
                >
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
