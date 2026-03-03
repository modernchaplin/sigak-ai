import InfographicList, { type InfographicItem } from "@/app/components/infographic-list";
import glossaryData from "@/data/glossary.json";

export default function GlossaryPage() {
  return (
    <InfographicList
      heading="용어 사전"
      caption="시각화와 MVP 설계에서 자주 쓰는 핵심 용어를 간단한 정의와 함께 제공합니다."
      items={glossaryData as InfographicItem[]}
    />
  );
}
