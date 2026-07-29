import type React from "react";
import { Github, Mail } from "lucide-react";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="/" className="group inline-flex items-center gap-2.5">
            <BrandMark />
            <span className="text-[15px] font-semibold tracking-tight text-ink-deep">
              SOMA <span className="text-muted-foreground">Projects</span>
            </span>
          </a>

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
              className="inline-flex h-8 items-center rounded-full bg-ink px-3.5 text-[13px] font-medium text-paper transition-colors hover:bg-ink-deep"
            >
              문의하기
            </a>
          </nav>
        </div>
      </header>

      {children}

      <footer className="mt-24 border-t border-border bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-md">
              <div className="flex items-center gap-2.5">
                <BrandMark />
                <p className="text-[14px] font-semibold tracking-tight text-ink-deep">
                  SOMA Projects
                </p>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                소프트웨어 마에스트로 프로그램의 프로젝트들을 한 곳에서 탐색하는
                비공식 아카이브입니다.
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

          <p className="mt-10 border-t border-border pt-6 text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} SOMA Projects. 비공식 커뮤니티
            아카이브.
          </p>
        </div>
      </footer>
    </>
  );
}

/** A 2×2 dot grid — a small index of projects gathered in one place. */
function BrandMark() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-deep shadow-xs transition-transform group-hover:scale-105">
      <span className="grid grid-cols-2 gap-[3px]">
        <span className="h-[5px] w-[5px] rounded-[1.5px] bg-paper" />
        <span className="h-[5px] w-[5px] rounded-[1.5px] bg-paper/55" />
        <span className="h-[5px] w-[5px] rounded-[1.5px] bg-paper/55" />
        <span className="h-[5px] w-[5px] rounded-[1.5px] bg-accent" />
      </span>
    </span>
  );
}
