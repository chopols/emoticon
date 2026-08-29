import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이모티콘 스프라이트 자르기",
  description:
    "15개 캐릭터 스프라이트 시트를 15칸 그리드로 자른 뒤 각각 360×360 JPG로 변환해 ZIP으로 다운로드하는 도구",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
