import InfographicList, { type InfographicItem } from "@/app/components/infographic-list";
import speedData from "@/data/speed.json";

export default function SpeedPage() {
  return (
    <InfographicList
      heading="속도 체험"
      caption="사용자가 빠르게 읽고 판단할 수 있는 인터페이스 속도 원리를 실무 관점으로 정리했습니다."
      items={speedData as InfographicItem[]}
    />
  );
}
