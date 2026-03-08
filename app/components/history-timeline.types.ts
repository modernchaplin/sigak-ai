export type HistorySource = {
  label: string;
  url: string;
};

export type HistoryEvent = {
  id: string;
  year: number;
  date: string;
  title: string;
  summary: string;
  detail: string;
  tags: string[];
  sources: HistorySource[];
  importance: "main" | "sub";
};
