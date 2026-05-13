import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Github, Mail } from "lucide-react";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SOMA Projects — 소프트웨어 마에스트로 프로젝트 아카이브",
  description:
    "소프트웨어 마에스트로 프로그램의 모든 프로젝트를 한 곳에서. 기수별·분야별로 탐색하고, 우수 프로젝트를 한눈에 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-background">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-tight text-ink-deep"
            >
              SOMA Projects
            </Link>

            <nav className="flex items-center gap-5 text-[13.5px] text-muted-foreground">
              <a
                href="https://www.swmaestro.org/sw/singl/projectIntc/list.do?menuNo=200013"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden transition-colors hover:text-foreground sm:inline"
              >
                SW마에스트로
              </a>
              <a
                href="https://github.com/wibaek/soma-projects"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden transition-colors hover:text-foreground sm:inline"
              >
                GitHub
              </a>
              <a
                href="https://open.kakao.com/o/sFa5F6rh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground transition-colors hover:text-brand"
              >
                문의하기
              </a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="mt-24 border-t border-border">
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-md">
                <p className="text-[14px] font-semibold tracking-tight text-ink-deep">
                  SOMA Projects
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  소프트웨어 마에스트로 프로그램의 프로젝트들을 한 곳에서
                  탐색하는 비공식 아카이브입니다.
                </p>
              </div>

              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
                <li>
                  <a
                    href="https://www.swmaestro.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    SW마에스트로
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/wibaek/soma-projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:devmuromi@gmail.com"
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>
                </li>
              </ul>
            </div>

            <p className="mt-8 border-t border-border pt-6 text-[12px] text-muted-foreground">
              © {new Date().getFullYear()} SOMA Projects. 비공식 커뮤니티
              아카이브.
            </p>
          </div>
        </footer>
      </body>
      <GoogleAnalytics gaId="G-4T61K4G2VE" />
    </html>
  );
}
