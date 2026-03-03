import InfographicList, { type InfographicItem } from "@/app/components/infographic-list";
import historyData from "@/data/timeline.history.json";

export default function TimelinePage() {
  return (
    <InfographicList
      heading="역사 타임라인"
      caption="시각화 언어가 발전한 주요 전환점을 간단한 카드 흐름으로 정리했습니다."
      items={historyData as InfographicItem[]}
    />
  );
}
