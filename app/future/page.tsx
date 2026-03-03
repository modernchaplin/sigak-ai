import InfographicList, { type InfographicItem } from "@/app/components/infographic-list";
import futureData from "@/data/timeline.future.json";

export default function FuturePage() {
  return (
    <InfographicList
      heading="미래 시나리오"
      caption="가까운 미래에 등장할 시각 AI 인터페이스 흐름을 예측 중심으로 정리했습니다."
      items={futureData as InfographicItem[]}
    />
  );
}
