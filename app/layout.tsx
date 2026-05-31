import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "나만 아는 이야기",
  description: "지도교수님의 말, 행동, 성향을 기록하고 AI로 이해하는 나만의 비서",
  openGraph: {
    title: "나만 아는 이야기",
    description: "지도교수님의 말, 행동, 성향을 기록하고 AI로 이해하는 나만의 비서",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "나만 아는 이야기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "나만 아는 이야기",
    description: "지도교수님의 말, 행동, 성향을 기록하고 AI로 이해하는 나만의 비서",
    images: ["/og-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
