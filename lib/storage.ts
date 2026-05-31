import { LogEntry, ProfessorProfile, AppSettings } from "./types";

const KEYS = {
  logs: "prof_logs",
  profile: "prof_profile",
  settings: "prof_settings",
};

export function getLogs(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.logs) || "[]");
  } catch {
    return [];
  }
}

export function saveLog(entry: LogEntry): void {
  const logs = getLogs();
  logs.unshift(entry);
  localStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

export function deleteLog(id: string): void {
  const logs = getLogs().filter((l) => l.id !== id);
  localStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

export function getProfile(): ProfessorProfile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    return JSON.parse(localStorage.getItem(KEYS.profile) || "null") || defaultProfile();
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(profile: ProfessorProfile): void {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return { apiKey: "" };
  try {
    return JSON.parse(localStorage.getItem(KEYS.settings) || "null") || { apiKey: "" };
  } catch {
    return { apiKey: "" };
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEYS.settings, JSON.stringify(s));
}

function defaultProfile(): ProfessorProfile {
  return {
    name: "",
    field: "",
    commStyle: "",
    contactPref: "",
    moodPattern: "",
    landmines: "",
    praiseStyle: "",
    complaintStyle: "",
    requestVsOrder: "",
    notes: "",
  };
}
