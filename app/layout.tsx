import type React from "react";
import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Github, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
    <html
      lang="ko"
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
            <Link
              href="/"
              className="group flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
            >
              <Logo />
              <span className="flex items-baseline gap-1.5">
                <span className="text-ink-deep">SOMA</span>
                <span className="font-normal text-muted-foreground">
                  Projects
                </span>
              </span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <a
                href="https://github.com/wibaek/soma-projects"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground sm:inline-flex"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://open.kakao.com/o/sFa5F6rh"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-3 text-[13px] font-medium text-paper transition-all hover:bg-ink-deep"
              >
                문의하기
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="mt-32 border-t border-border bg-subtle/40">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
            <div className="grid gap-10 sm:grid-cols-12">
              <div className="sm:col-span-6">
                <div className="flex items-center gap-2.5 text-[15px] font-semibold">
                  <Logo />
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-ink-deep">SOMA</span>
                    <span className="font-normal text-muted-foreground">
                      Projects
                    </span>
                  </span>
                </div>
                <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
                  소프트웨어 마에스트로 프로그램의 프로젝트들을 한 곳에서
                  탐색하고 발견하는 비공식 아카이브.
                </p>
              </div>

              <div className="sm:col-span-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Resources
                </p>
                <ul className="mt-3 space-y-2 text-[13.5px]">
                  <li>
                    <a
                      href="https://www.swmaestro.org/sw/singl/projectIntc/list.do?menuNo=200013"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-foreground/80 transition-colors hover:text-brand"
                    >
                      주요 프로젝트 소개
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.swmaestro.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-foreground/80 transition-colors hover:text-brand"
                    >
                      SW마에스트로 공식 사이트
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="sm:col-span-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Contact
                </p>
                <ul className="mt-3 space-y-2 text-[13.5px]">
                  <li>
                    <a
                      href="https://github.com/wibaek/soma-projects"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-foreground/80 transition-colors hover:text-brand"
                    >
                      <Github className="h-3.5 w-3.5" />
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:devmuromi@gmail.com"
                      className="inline-flex items-center gap-1.5 text-foreground/80 transition-colors hover:text-brand"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center">
              <p>
                © {new Date().getFullYear()} SOMA Projects. 비공식 커뮤니티
                아카이브.
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
                Crafted with care · Seoul · ’26
              </p>
            </div>
          </div>
        </footer>
      </body>
      <GoogleAnalytics gaId="G-4T61K4G2VE" />
    </html>
  );
}

function Logo() {
  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink text-paper shadow-sm">
      <span className="font-serif text-[14px] italic leading-none">S</span>
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
    </span>
  );
}
