"use client";

import type { SigakTopic } from "@/app/components/sigak-home";

type SigakDetailModalProps = {
  topic: SigakTopic | null;
  onClose: () => void;
};

export default function SigakDetailModal({ topic, onClose }: SigakDetailModalProps) {
  if (!topic) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/72 px-4 py-4 backdrop-blur-sm md:items-center md:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sigak-detail-title"
      onClick={onClose}
    >
      <article
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-5 text-white shadow-2xl md:max-w-xl md:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <p className="mono text-xs tracking-[0.18em] text-yellow-300">준비 중</p>
            <h2 id="sigak-detail-title" className="mt-2 text-2xl font-semibold md:text-3xl">
              {topic.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-yellow-300 hover:text-yellow-200"
            aria-label="상세 카드 닫기"
          >
            닫기
          </button>
        </div>

        <p className="mt-5 text-sm leading-7 text-zinc-300">{topic.summary}</p>
        <p className="mt-4 rounded-md border border-yellow-300/30 bg-yellow-300/8 p-4 text-sm leading-7 text-yellow-100">
          이 항목은 5축 구조를 보여주기 위한 MVP 카드입니다. 상세 콘텐츠는 다음 단계에서
          축별로 채워 넣습니다.
        </p>
      </article>
    </div>
  );
}
