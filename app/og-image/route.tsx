import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #1a3a5c 0%, #2d5a8e 60%, #3d7ab5 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 배경 장식 원 */}
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-100px",
          left: "-60px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />

        {/* 아이콘 */}
        <div style={{
          fontSize: "80px",
          marginBottom: "32px",
        }}>📖</div>

        {/* 제목 */}
        <div style={{
          fontSize: "72px",
          fontWeight: "800",
          color: "white",
          letterSpacing: "-2px",
          marginBottom: "20px",
        }}>
          나만 아는 이야기
        </div>

        {/* 설명 */}
        <div style={{
          fontSize: "30px",
          color: "rgba(255,255,255,0.75)",
          fontWeight: "400",
        }}>
          교수님의 말과 행동을 AI로 이해하는 나만의 비서
        </div>

        {/* 하단 태그 */}
        <div style={{
          position: "absolute",
          bottom: "48px",
          display: "flex",
          gap: "16px",
        }}>
          {["기록 저장소", "AI 해석", "AI 작성"].map((tag) => (
            <div key={tag} style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "24px",
              padding: "8px 24px",
              color: "white",
              fontSize: "22px",
            }}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
