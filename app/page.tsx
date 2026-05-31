"use client";
import { useState } from "react";
import ProfileTab from "@/components/ProfileTab";
import LogTab from "@/components/LogTab";
import DecodeTab from "@/components/DecodeTab";
import ComposeTab from "@/components/ComposeTab";
import SettingsModal from "@/components/SettingsModal";

const TABS = [
  { id: "profile", label: "그녀의 프로필", emoji: "👤" },
  { id: "log", label: "기록 저장소", emoji: "📋" },
  { id: "decode", label: "AI 해석", emoji: "🔍" },
  { id: "compose", label: "AI 작성", emoji: "✏️" },
];

export default function Home() {
  const [tab, setTab] = useState("profile");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header
        className="sticky top-0 z-10 border-b px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div>
          <h1 className="font-bold text-lg" style={{ color: "var(--primary)" }}>
            나만 아는 이야기
          </h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="text-sm px-3 py-1.5 rounded-lg border"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          ⚙️ 설정
        </button>
      </header>

      <nav
        className="sticky top-[61px] z-10 border-b flex overflow-x-auto"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
            style={{
              borderBottomColor: tab === t.id ? "var(--primary)" : "transparent",
              color: tab === t.id ? "var(--primary)" : "var(--muted)",
            }}
          >
            <span className="mr-1">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {tab === "profile" && <ProfileTab />}
        {tab === "log" && <LogTab />}
        {tab === "decode" && <DecodeTab />}
        {tab === "compose" && <ComposeTab />}
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
