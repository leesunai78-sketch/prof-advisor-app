"use client";
import { useState, useEffect } from "react";
import { getLogs, saveLog, deleteLog } from "@/lib/storage";
import { LogEntry, LogType } from "@/lib/types";
import { getSettings, getProfile } from "@/lib/storage";

const TYPE_COLORS: Record<LogType, string> = {
  구두발언: "#2d5a8e",
  카톡: "#27ae60",
  이메일: "#8e44ad",
  통화_회의: "#e8734a",
  행동_반응: "#c0392b",
  감정_분위기: "#f39c12",
  지뢰발견: "#c0392b",
  패턴발견: "#16a085",
  기타: "#8a8680",
};

const TYPE_LABELS: Record<LogType, string> = {
  구두발언: "구두 발언",
  카톡: "카톡",
  이메일: "이메일",
  통화_회의: "통화·회의",
  행동_반응: "행동·반응",
  감정_분위기: "감정·분위기",
  지뢰발견: "⚠️ 지뢰 발견",
  패턴발견: "패턴 발견",
  기타: "기타",
};

async function classifyWithAI(content: string, apiKey: string, profileStr: string): Promise<{ type: LogType; tags: string[]; summary: string }> {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      systemPrompt: `당신은 지도교수와의 관계를 관리하는 앱의 AI입니다.
교수님 프로필 정보: ${profileStr}

사용자가 입력한 내용을 분석해서 아래 JSON 형식으로만 답하세요. 다른 말은 하지 마세요.
{
  "type": "구두발언|카톡|이메일|통화_회의|행동_반응|감정_분위기|지뢰발견|패턴발견|기타",
  "tags": ["태그1", "태그2"],
  "summary": "한 줄 요약 (20자 이내)"
}`,
      userMessage: content,
    }),
  });
  const data = await res.json();
  try {
    return JSON.parse(data.result);
  } catch {
    return { type: "기타", tags: [], summary: content.slice(0, 30) };
  }
}

export default function LogTab() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<LogType | "전체">("전체");

  useEffect(() => {
    setLogs(getLogs());
  }, []);

  async function handleAdd() {
    if (!input.trim()) return;
    setLoading(true);

    const { apiKey } = getSettings();
    const profile = getProfile();
    const profileStr = `이름: ${profile.name}, 전공: ${profile.field}, 스타일: ${profile.commStyle}, 지뢰: ${profile.landmines}`;

    let type: LogType = "기타";
    let tags: string[] = [];
    let summary = input.slice(0, 30);

    if (apiKey) {
      try {
        const result = await classifyWithAI(input, apiKey, profileStr);
        type = result.type;
        tags = result.tags;
        summary = result.summary;
      } catch {
        // API 실패 시 기본값 사용
      }
    }

    const entry: LogEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("ko-KR"),
      type,
      content: input,
      summary,
      tags,
      createdAt: Date.now(),
    };

    saveLog(entry);
    setLogs(getLogs());
    setInput("");
    setLoading(false);
  }

  function handleDelete(id: string) {
    if (!confirm("이 기록을 삭제할까요?")) return;
    deleteLog(id);
    setLogs(getLogs());
  }

  const filtered = logs.filter((l) => {
    const matchSearch = search === "" || l.content.includes(search) || l.summary?.includes(search) || l.tags.some((t) => t.includes(search));
    const matchType = filterType === "전체" || l.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-4">
      {/* 입력 영역 */}
      <div className="rounded-2xl border p-4 space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <p className="text-sm font-semibold">📋 기록 추가</p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          교수님의 말, 카톡 내용, 오늘 있었던 일, 느낀 점 — 뭐든 그냥 던져주세요. AI가 알아서 분류합니다.
        </p>
        <textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예시:&#10;• 오늘 교수님이 '다음 주까지 자료 정리해와'라고 하셨다&#10;• 카톡으로 '잠깐 들러'라고만 오셨는데 뭔 뜻인지 모르겠다&#10;• 오늘 교수님 표정이 굳어있었고 말씀이 짧으셨다&#10;• 메일에 답장이 3일째 없다"
          className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
          style={{ borderColor: "var(--border)" }}
        />
        <button
          onClick={handleAdd}
          disabled={loading || !input.trim()}
          className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
          style={{ background: "var(--primary)" }}
        >
          {loading ? "AI가 분류 중..." : "기록 저장"}
        </button>
        {!getSettings().apiKey && (
          <p className="text-xs text-center" style={{ color: "var(--warning)" }}>
            ⚠️ API 키가 없으면 자동 분류 없이 '기타'로 저장됩니다. 설정에서 API 키를 입력하세요.
          </p>
        )}
      </div>

      {/* 검색·필터 */}
      <div className="space-y-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔎 검색"
          className="w-full border rounded-xl px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["전체", ...Object.keys(TYPE_LABELS)] as (LogType | "전체")[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border font-medium"
              style={{
                borderColor: filterType === t ? "var(--primary)" : "var(--border)",
                background: filterType === t ? "var(--primary-light)" : "var(--card)",
                color: filterType === t ? "var(--primary)" : "var(--muted)",
              }}
            >
              {t === "전체" ? "전체" : TYPE_LABELS[t as LogType]}
            </button>
          ))}
        </div>
      </div>

      {/* 기록 목록 */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>
            기록이 없습니다
          </p>
        )}
        {filtered.map((log) => (
          <div key={log.id} className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ background: TYPE_COLORS[log.type] }}
                >
                  {TYPE_LABELS[log.type]}
                </span>
                {log.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                    #{tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleDelete(log.id)}
                className="text-xs shrink-0"
                style={{ color: "var(--muted)" }}
              >
                삭제
              </button>
            </div>
            {log.summary && log.summary !== log.content && (
              <p className="text-sm font-medium mb-1">{log.summary}</p>
            )}
            <p className="text-sm" style={{ color: "var(--muted)" }}>{log.content}</p>
            <p className="text-xs mt-2" style={{ color: "var(--border)" }}>{log.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
