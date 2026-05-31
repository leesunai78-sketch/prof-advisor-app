"use client";
import { useState, useEffect } from "react";
import { getProfile, saveProfile } from "@/lib/storage";
import { ProfessorProfile } from "@/lib/types";

const FIELDS: { key: keyof ProfessorProfile; label: string; placeholder: string; hint: string }[] = [
  { key: "name", label: "교수님 성함", placeholder: "예: 김OO 교수님", hint: "" },
  { key: "field", label: "전공 분야", placeholder: "예: 경영학 / 사회복지학 / 교육학", hint: "" },
  { key: "commStyle", label: "커뮤니케이션 스타일", placeholder: "예: 말이 짧고 직접적 / 돌려서 말하는 편 / 감정 표현이 거의 없음", hint: "교수님이 평소에 어떻게 말씀하시는지" },
  { key: "contactPref", label: "연락 선호 방식", placeholder: "예: 카톡 선호 / 메일만 / 직접 대면 선호", hint: "" },
  { key: "moodPattern", label: "기분 변화 패턴", placeholder: "예: 월요일 오전엔 예민함 / 마감 전후로 반응 없음 / 특별한 패턴 없음", hint: "알아챈 패턴이 있으면 적어두세요" },
  { key: "landmines", label: "⚠️ 지뢰 포인트", placeholder: "예: 늦은 보고를 매우 싫어함 / 형식이 틀리면 불쾌해함 / 약속 시간에 예민함", hint: "특히 조심해야 할 것들" },
  { key: "praiseStyle", label: "칭찬 표현 방식", placeholder: "예: '나름 했네' = 잘했다는 의미 / 침묵 = 만족 / 칭찬을 거의 안 하심", hint: "칭찬인지 아닌지 구분이 어려울 때 참고" },
  { key: "complaintStyle", label: "불만 표현 방식", placeholder: "예: 말이 짧아짐 / 답장 지연 / '다시 생각해봐'라고 하심", hint: "교수님이 불만족스러울 때 어떤 신호를 보이시는지" },
  { key: "requestVsOrder", label: "요청 vs 지시 구분", placeholder: "예: '한번 봐봐' = 반드시 해야 함 / '생각해봐' = 선택", hint: "교수님의 표현이 부탁인지 명령인지 헷갈릴 때 참고" },
  { key: "notes", label: "기타 특이사항", placeholder: "그 외 알아두면 도움이 되는 것들", hint: "" },
];

export default function ProfileTab() {
  const [profile, setProfile] = useState<ProfessorProfile>(getProfile());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  function handleChange(key: keyof ProfessorProfile, value: string) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const filled = Object.values(profile).filter(Boolean).length;
  const total = FIELDS.length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 border" style={{ background: "var(--primary-light)", borderColor: "var(--primary)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--primary)" }}>
          👤 교수님 프로필
        </p>
        <p className="text-xs" style={{ color: "var(--primary)" }}>
          아는 것만 채워도 됩니다. 기록이 쌓이면 AI가 자동으로 보완해 드립니다.
        </p>
        <div className="mt-2 h-1.5 rounded-full" style={{ background: "rgba(45,90,142,0.2)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(filled / total) * 100}%`, background: "var(--primary)" }}
          />
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--primary)" }}>
          {filled} / {total} 항목 작성됨
        </p>
      </div>

      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium mb-1">{f.label}</label>
          {f.hint && <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{f.hint}</p>}
          <textarea
            rows={2}
            value={profile[f.key]}
            onChange={(e) => handleChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        className="w-full py-3 rounded-xl text-white font-semibold"
        style={{ background: saved ? "var(--success)" : "var(--primary)" }}
      >
        {saved ? "✓ 저장되었습니다" : "저장하기"}
      </button>
    </div>
  );
}
