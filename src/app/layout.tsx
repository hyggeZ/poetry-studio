import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "拾字成诗 · 在旧文字里，遇见新诗",
  description: "从苏轼的《赤壁赋》中拾起文字，拼成属于你自己的诗。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
