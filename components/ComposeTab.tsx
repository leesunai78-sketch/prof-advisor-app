"use client";
import { useState } from "react";
import { getSettings, getProfile, getLogs } from "@/lib/storage";

const COMPOSE_TYPES = [
  { id: "이메일", label: "📧 이메일", hint: "제목 포함, 격식체" },
  { id: "카톡문자", label: "💬 카톡·문자", hint: "짧고 간결하게" },
  { id: "미팅요청", label: "📅 미팅 요청", hint: "면담 일정 잡기" },
  { id: "보고", label: "📝 보고 메시지", hint: "진행 상황 보고" },
  { id: "부탁요청", label: "🙏 부탁·요청", hint: "기한 연장, 도움 요청 등" },
  { id: "사과해명", label: "😔 사과·해명", hint: "실수했거나 상황이 안 좋을 때" },
];

export default function ComposeTab() {
  const [composeType, setComposeType] = useState("이메일");
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tone, setTone] = useState("기본");
  const [copied, setCopied] = useState(false);

  async function handleCompose() {
    if (!purpose.trim()) return;
    const { apiKey } = getSettings();
    if (!apiKey) {
      setError("설정에서 Claude API 키를 먼저 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    setResult("");

    const profile = getProfile();
    const logs = getLogs().slice(0, 15);
    const recentLogs = logs.map((l) => `[${l.type}] ${l.summary || l.content}`).join("\n");

    const systemPrompt = `당신은 대학원생이 지도교수님께 보내는 글을 대신 써주는 AI입니다.
교수님의 성향과 과거 소통 패턴을 바탕으로 가장 적절한 글을 작성해주세요.

[교수님 프로필]
이름: ${profile.name || "교수님"}
커뮤니케이션 스타일: ${profile.commStyle || "미입력"}
연락 선호 방식: ${profile.contactPref || "미입력"}
지뢰 포인트: ${profile.landmines || "미입력"}
불만 표현 방식: ${profile.complaintStyle || "미입력"}

[최근 기록 (맥락 참고용)]
${recentLogs || "없음"}

[작성 지침]
- 유형: ${composeType}
- 어조: ${tone}
- ${composeType === "이메일" ? "제목을 반드시 포함하세요. 형식: 제목: [제목]\n\n[본문]" : ""}
- ${composeType === "카톡문자" ? "짧고 간결하게, 2-4문장 이내" : ""}
- 교수님 성향에 맞게 작성하되, 지뢰 포인트를 피하세요.
- 한국어로 작성하세요.
- 완성된 글만 출력하세요. 설명이나 부연은 필요 없습니다.`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          systemPrompt,
          userMessage: `목적: ${purpose}`,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "작성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefine(instruction: string) {
    if (!result) return;
    const { apiKey } = getSettings();
    if (!apiKey) return;
    setLoading(true);

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          systemPrompt: "아래 글을 지시에 따라 수정해주세요. 수정된 글만 출력하세요. 설명은 필요 없습니다.",
          userMessage: `[원문]\n${result}\n\n[수정 지시]\n${instruction}`,
        }),
      });
      const data = await res.json();
      if (!data.error) setResult(data.result);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const currentType = COMPOSE_TYPES.find((t) => t.id === composeType);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4" style={{ background: "var(--primary-light)", borderColor: "var(--primary)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--primary)" }}>✏️ AI 작성</p>
        <p className="text-xs" style={{ color: "var(--primary)" }}>
          보내고 싶은 내용을 말해주면 AI가 교수님 성향에 맞게 대신 써드립니다.
          교수님 프로필이 채워질수록 더 정확해집니다.
        </p>
      </div>

      {/* 유형 선택 */}
      <div className="grid grid-cols-3 gap-2">
        {COMPOSE_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => { setComposeType(t.id); setResult(""); }}
            className="py-2.5 px-2 rounded-xl border text-xs font-medium text-center"
            style={{
              borderColor: composeType === t.id ? "var(--primary)" : "var(--border)",
              background: composeType === t.id ? "var(--primary-light)" : "var(--card)",
              color: composeType === t.id ? "var(--primary)" : "var(--muted)",
            }}
          >
            <div>{t.label}</div>
            <div className="text-xs opacity-70 mt-0.5">{t.hint}</div>
          </button>
        ))}
      </div>

      {/* 어조 선택 */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>어조</p>
        <div className="flex gap-2">
          {["기본", "더 공손하게", "더 간결하게", "정중하게"].map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className="text-xs px-3 py-1.5 rounded-full border"
              style={{
                borderColor: tone === t ? "var(--primary)" : "var(--border)",
                background: tone === t ? "var(--primary-light)" : "var(--card)",
                color: tone === t ? "var(--primary)" : "var(--muted)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 목적 입력 */}
      <div className="rounded-2xl border p-4 space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <label className="text-sm font-medium">
          어떤 내용을 보내고 싶으신가요? ({currentType?.hint})
        </label>
        <textarea
          rows={3}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="예: 다음 주 화요일 면담 요청하고 싶다 / 논문 초안 제출이 3일 늦을 것 같다 / 오늘 미팅 내용 정리해서 보내고 싶다"
          className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
          style={{ borderColor: "var(--border)" }}
        />
        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
        <button
          onClick={handleCompose}
          disabled={loading || !purpose.trim()}
          className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
          style={{ background: "var(--primary)" }}
        >
          {loading ? "AI가 작성 중..." : "대신 써줘"}
        </button>
      </div>

      {/* 결과 */}
      {result && (
        <div className="rounded-2xl border p-4 space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">작성된 내용</p>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-lg border"
              style={{ borderColor: "var(--border)", color: "var(--primary)" }}
            >
              {copied ? "✓ 복사됨" : "복사"}
            </button>
          </div>
          <pre className="text-sm whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "inherit" }}>
            {result}
          </pre>

          {/* 수정 요청 */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>수정 요청</p>
            <div className="flex flex-wrap gap-2">
              {["더 공손하게", "더 짧게", "더 자세하게", "더 부드럽게", "더 직접적으로"].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRefine(r)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full border disabled:opacity-40"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
