export type LogType =
  | "구두발언"
  | "카톡"
  | "이메일"
  | "통화_회의"
  | "행동_반응"
  | "감정_분위기"
  | "지뢰발견"
  | "패턴발견"
  | "기타";

export interface LogEntry {
  id: string;
  date: string;
  type: LogType;
  content: string;
  summary?: string;
  tags: string[];
  createdAt: number;
}

export interface ProfessorProfile {
  name: string;
  field: string;
  commStyle: string;
  contactPref: string;
  moodPattern: string;
  landmines: string;
  praiseStyle: string;
  complaintStyle: string;
  requestVsOrder: string;
  notes: string;
}

export interface AppSettings {
  apiKey: string;
}
