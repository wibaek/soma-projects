import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { type Project } from "@/lib/data";

interface ProjectDetailPageProps {
  project: Project;
}

export function ProjectDetailPage({ project }: ProjectDetailPageProps) {
  const hasImage = Boolean(project.imageUrl);

  return (
    <main className="relative">
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
          <a
            href="/"
            className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink-deep"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            프로젝트 목록으로
          </a>

          <div className="mt-10 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <span className="font-mono normal-case tracking-tight">
              {project.generation}기
            </span>
            {project.type && (
              <>
                <span className="text-border">/</span>
                <span>{project.type}</span>
              </>
            )}
            {project.rank && (
              <>
                <span className="text-border">/</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  우수 프로젝트
                </span>
              </>
            )}
          </div>

          <h1 className="mt-5 max-w-4xl text-balance text-[clamp(1.875rem,4.2vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-ink-deep">
            {project.title}
          </h1>

          <div className="mt-10 pb-12 sm:pb-16">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-subtle sm:aspect-[21/9]">
              {hasImage ? (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    이미지가 등록되지 않은 프로젝트
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              About
            </p>
            <div className="mt-4 border-t border-border pt-6">
              <MarkdownRenderer content={project.description} />
            </div>
          </div>

          <aside className="md:col-span-4">
            <div className="sticky top-20 space-y-6 rounded-xl border border-border bg-card p-6">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  프로젝트 정보
                </p>
                <dl className="mt-4 space-y-3.5 text-[14px]">
                  <Info label="기수">
                    <span className="nums">{project.generation}</span>기
                  </Info>
                  <Info label="분야">{project.type || "미분류"}</Info>
                  {project.rank && (
                    <Info label="등급">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        우수 프로젝트
                      </span>
                    </Info>
                  )}
                </dl>
              </div>

              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-between gap-2 rounded-lg bg-ink px-4 py-3 text-[14px] font-medium text-paper transition-colors hover:bg-ink-deep"
                >
                  <span>프로젝트 방문하기</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ) : (
                <div className="rounded-lg border border-dashed border-border px-4 py-3 text-center text-[13px] text-muted-foreground">
                  공식 링크가 제공되지 않았습니다
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-[12px] font-medium text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-ink-deep">{children}</dd>
    </div>
  );
}
