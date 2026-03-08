import HistoryTimeline from "@/app/components/history-timeline";
import type { HistoryEvent } from "@/app/components/history-timeline.types";
import historyEvents from "@/data/history.events.json";

export default function HistoryPage() {
  return <HistoryTimeline items={historyEvents as HistoryEvent[]} />;
}
