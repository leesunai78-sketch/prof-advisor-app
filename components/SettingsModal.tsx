"use client";
import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "@/lib/storage";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    setApiKey(getSettings().apiKey);
  }, []);

  function handleSave() {
    saveSettings({ apiKey });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "var(--card)" }}>
        <h2 className="text-lg font-bold mb-1">설정</h2>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          AI 기능을 사용하려면 Claude API 키가 필요합니다.
        </p>

        <label className="block text-sm font-medium mb-1">Claude API 키</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
          style={{ borderColor: "var(--border)" }}
        />
        <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>
          키는 이 기기의 브라우저에만 저장됩니다. 외부로 전송되지 않습니다.
          <br />
          API 키 발급: console.anthropic.com → API Keys
        </p>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            취소
          </button>
          <button onClick={handleSave} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--primary)" }}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
