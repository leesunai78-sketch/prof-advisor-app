"use client";
import { useState } from "react";
import { getSettings, getProfile, getLogs } from "@/lib/storage";

const DECODE_TYPES = [
  { id: "말해석", label: "말 해석", placeholder: "그녀가 한 말을 그대로 입력하세요\n예: '이 부분은 좀 더 다듬어야 할 것 같다'" },
  { id: "행동반응", label: "행동·반응 해석", placeholder: "그녀의 행동이나 반응을 설명하세요\n예: '메일 보낸 지 3일이 지났는데 답장이 없어요'" },
  { id: "분위기", label: "분위기·감정 해석", placeholder: "오늘 느낀 분위기나 그녀의 상태를 설명하세요\n예: '오늘 표정이 굳어있었고 말이 평소보다 짧았어요'" },
  { id: "타이밍", label: "타이밍 판단", placeholder: "지금 해도 되는지 판단이 필요한 상황을 설명하세요\n예: '지금 기한 연장 부탁해도 될까요?'" },
];

interface DecodeResult {
  interpretation: string;
  temperature: string;
  temperatureEmoji: string;
  action: string;
  urgency: string;
}

export default function DecodeTab() {
  const [decodeType, setDecodeType] = useState("말해석");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDecode() {
    if (!input.trim()) return;
    const { apiKey } = getSettings();
    if (!apiKey) {
      setError("설정에서 Claude API 키를 먼저 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const profile = getProfile();
    const logs = getLogs().slice(0, 20);
    const recentLogs = logs.map((l) => `[${l.type}] ${l.summary || l.content}`).join("\n");

    const systemPrompt = `당신은 대학원생의 지도교수 관계를 도와주는 AI입니다.
아래 그녀에 대한 정보와 최근 기록을 바탕으로 상황을 분석해주세요.

[그녀의 프로필]
이름: ${profile.name || "미입력"}
커뮤니케이션 스타일: ${profile.commStyle || "미입력"}
기분 변화 패턴: ${profile.moodPattern || "미입력"}
지뢰 포인트: ${profile.landmines || "미입력"}
칭찬 표현: ${profile.praiseStyle || "미입력"}
불만 표현: ${profile.complaintStyle || "미입력"}
요청 vs 지시: ${profile.requestVsOrder || "미입력"}

[최근 기록 (참고용)]
${recentLogs || "없음"}

반드시 아래 JSON 형식으로만 답하세요. 다른 말은 하지 마세요.
{
  "interpretation": "해석 내용 (구체적으로, 2-4문장)",
  "temperature": "만족|중립|불만|위험|불명확",
  "temperatureEmoji": "😊|😐|😤|🚨|❓",
  "action": "권장 대응 행동 (구체적으로)",
  "urgency": "지금 바로|오늘 중|내일|기다려도 됨|피하는 게 좋음"
}`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          systemPrompt,
          userMessage: `[해석 유형: ${decodeType}]\n${input}`,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed: DecodeResult = JSON.parse(data.result);
      setResult(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const currentType = DECODE_TYPES.find((t) => t.id === decodeType);

  const urgencyColor: Record<string, string> = {
    "지금 바로": "var(--danger)",
    "오늘 중": "var(--warning)",
    내일: "var(--primary)",
    "기다려도 됨": "var(--success)",
    "피하는 게 좋음": "var(--danger)",
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4" style={{ background: "var(--primary-light)", borderColor: "var(--primary)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--primary)" }}>🔍 AI 해석</p>
        <p className="text-xs" style={{ color: "var(--primary)" }}>
          그녀의 말, 행동, 분위기를 입력하면 AI가 의미와 대응 방향을 알려드립니다.
          그녀의 프로필과 기록 저장소에 데이터가 많을수록 더 정확해집니다.
        </p>
      </div>

      {/* 해석 유형 선택 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DECODE_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => { setDecodeType(t.id); setResult(null); setInput(""); }}
            className="whitespace-nowrap text-sm px-4 py-2 rounded-full border font-medium"
            style={{
              borderColor: decodeType === t.id ? "var(--primary)" : "var(--border)",
              background: decodeType === t.id ? "var(--primary)" : "var(--card)",
              color: decodeType === t.id ? "white" : "var(--muted)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 입력 */}
      <div className="rounded-2xl border p-4 space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentType?.placeholder}
          className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
          style={{ borderColor: "var(--border)" }}
        />
        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
        <button
          onClick={handleDecode}
          disabled={loading || !input.trim()}
          className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
          style={{ background: "var(--primary)" }}
        >
          {loading ? "AI가 분석 중..." : "해석해줘"}
        </button>
      </div>

      {/* 결과 */}
      {result && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {/* 감정 온도 */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">{result.temperatureEmoji}</span>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>그녀의 감정 온도</p>
              <p className="font-semibold">{result.temperature}</p>
            </div>
          </div>

          {/* 해석 */}
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>💬 해석</p>
            <p className="text-sm leading-relaxed">{result.interpretation}</p>
          </div>

          {/* 권장 대응 */}
          <div className="rounded-xl p-3" style={{ background: "var(--background)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>✅ 권장 대응</p>
            <p className="text-sm">{result.action}</p>
          </div>

          {/* 타이밍 */}
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>⏰ 타이밍:</p>
            <span
              className="text-sm font-bold"
              style={{ color: urgencyColor[result.urgency] || "var(--foreground)" }}
            >
              {result.urgency}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
