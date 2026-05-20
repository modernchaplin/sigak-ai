"use client";

import { useRef, useState, type CSSProperties, type MouseEvent } from "react";

type TimelineItem = {
  date: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  highlight?: "pink" | "blue";
};

const timelineItems: TimelineItem[] = [
  {
    date: "2022.11.30",
    title: "ChatGPT 출시",
    description: "GPT-3.5 기반 무료 연구 프리뷰",
    imageSrc: "/timeline/chatgpt-launch.png",
    imageAlt: "ChatGPT launch",
  },
  {
    date: "2023.03.14",
    title: "GPT-4",
    description: "멀티모달 시작, 이미지를 이해함",
    imageSrc: "/timeline/gpt-4.png",
    imageAlt: "GPT-4",
  },
  {
    date: "2024.05.13",
    title: "GPT-4o",
    description: "실시간 음성, 영화 'Her' 연상",
    imageSrc: "/timeline/gpt-4o.png",
    imageAlt: "GPT-4o",
  },
  {
    date: "2025.03.25",
    title: "지브리 열풍",
    description: "1주일에 7억 장 생성, 가입자 5억 돌파",
    imageSrc: "/timeline/ghibli.png",
    imageAlt: "Ghibli style AI image trend",
    highlight: "pink",
  },
  {
    date: "2025.08.07",
    title: "GPT-5",
    description: "추론·멀티모달 통합 모델",
    imageSrc: "/timeline/gpt-5.png",
    imageAlt: "GPT-5",
  },
  {
    date: "2025.12.11",
    title: "GPT-5.2",
    description: "에이전트·코딩 강화",
    imageSrc: "/timeline/gpt-5-2.png",
    imageAlt: "GPT-5.2",
  },
  {
    date: "2026.04.23",
    title: "GPT-5.5 (현재)",
    description: "OSWorld 78.7%, 컴퓨터 자율 조작",
    imageSrc: "/timeline/gpt-5-5.png",
    imageAlt: "GPT-5.5",
    highlight: "blue",
  },
];

function getHighlightStyles(item: TimelineItem) {
  if (item.highlight === "pink") {
    return {
      card: "border-[#D4537E] bg-[#FBEAF0] dark:border-[#F08CAE]/70 dark:bg-[#391522]",
      dot: "bg-[#D4537E] ring-[#FBEAF0] dark:bg-[#F08CAE] dark:ring-[#391522]",
      date: "text-[#A83E63] dark:text-[#F8B4CC]",
      image: "from-[#FBEAF0] to-white dark:from-[#391522] dark:to-zinc-950",
    };
  }

  if (item.highlight === "blue") {
    return {
      card: "border-[#378ADD] bg-[#E6F1FB] dark:border-[#75B7F4]/70 dark:bg-[#10243A]",
      dot: "bg-[#378ADD] ring-[#E6F1FB] dark:bg-[#75B7F4] dark:ring-[#10243A]",
      date: "text-[#256EAF] dark:text-[#A8D4FF]",
      image: "from-[#E6F1FB] to-white dark:from-[#10243A] dark:to-zinc-950",
    };
  }

  return {
    card: "border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
    dot: "bg-gray-950 ring-white dark:bg-zinc-100 dark:ring-zinc-950",
    date: "text-gray-500 dark:text-zinc-400",
    image: "from-gray-100 to-white dark:from-zinc-900 dark:to-zinc-950",
  };
}

function TimelineImage({ item }: { item: TimelineItem }) {
  const [hasError, setHasError] = useState(false);
  const styles = getHighlightStyles(item);

  if (hasError) {
    return (
      <div
        className={`flex aspect-[16/10] items-center justify-center rounded-t-lg bg-gradient-to-br ${styles.image}`}
      >
        <div className="px-5 text-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{item.title}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Image pending</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={item.imageSrc}
      alt={item.imageAlt}
      draggable={false}
      loading="lazy"
      onError={() => setHasError(true)}
      className="aspect-[16/10] w-full rounded-t-lg object-cover select-none"
    />
  );
}

export function ChatGptTimeline() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const scrollBy = (left: number) => {
    scrollRef.current?.scrollBy({ left, behavior: "smooth" });
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;

    setIsDragging(true);
    startXRef.current = event.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;

    event.preventDefault();
    const x = event.pageX - scrollRef.current.offsetLeft;
    const walk = x - startXRef.current;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  return (
    <section className="rounded-3xl border border-gray-200 bg-[#FAFAF7] p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-300">2022.11 → 2026.05</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 dark:text-zinc-100 md:text-4xl">
            ChatGPT 발전사
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-zinc-400">
            대화형 AI가 연구 프리뷰에서 에이전트형 모델로 확장되어 온 흐름
          </p>
        </div>

        <div className="flex gap-2 md:pb-1">
          <button
            type="button"
            aria-label="이전 타임라인으로 이동"
            onClick={() => scrollBy(-280)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-offset-zinc-950"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="다음 타임라인으로 이동"
            onClick={() => scrollBy(280)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-lg text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-offset-zinc-950"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        role="region"
        aria-label="ChatGPT 발전사 타임라인"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={`relative mt-8 overflow-x-auto scroll-smooth pb-4 ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
        style={{ WebkitOverflowScrolling: "touch" } as CSSProperties}
      >
        <div className="relative flex w-max gap-4 pr-2 pt-9">
          <div className="absolute left-0 right-2 top-[17px] h-px bg-gray-200 dark:bg-zinc-800" />
          {timelineItems.map((item) => {
            const styles = getHighlightStyles(item);
            const isHighlighted = Boolean(item.highlight);

            return (
              <article
                key={`${item.date}-${item.title}`}
                className={`relative shrink-0 rounded-lg border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  isHighlighted ? "w-[300px]" : "w-[260px]"
                } ${styles.card}`}
              >
                <span
                  className={`absolute left-5 top-[-27px] z-10 h-4 w-4 rounded-full ring-4 ${styles.dot}`}
                  aria-hidden="true"
                />
                <div className="p-4 pb-3">
                  <p className={`text-xs font-medium ${styles.date}`}>
                    {item.highlight ? "★ " : ""}
                    {item.date}
                  </p>
                </div>
                <TimelineImage item={item} />
                <div className="p-4">
                  <h3 className="text-lg font-semibold leading-tight text-gray-950 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-gray-500 dark:text-zinc-500">
        ← 드래그하거나 화살표로 이동 →
      </p>
    </section>
  );
}
