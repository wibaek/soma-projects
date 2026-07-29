import { ProjectBrowser } from "@/components/project-browser";
import type { Project } from "@/lib/data";

type HomePageProps = {
  projects: Project[];
  projectTypes: string[];
  projectGenerations: number[];
};

export function HomePage({
  projects,
  projectTypes,
  projectGenerations,
}: HomePageProps) {
  const excellentCount = projects.filter((project) => project.rank).length;

  return (
    <main className="relative">
      <section className="relative isolate overflow-hidden border-b border-border">
        {/* Atmosphere: a faint dot grid with a soft navy glow above the fold */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-dots opacity-60 mask-fade-b" />
          <div className="absolute left-1/2 top-[-14rem] h-[26rem] w-[44rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[110px]" />
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-24">
          <div className="reveal reveal-1 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span className="inline-flex h-[22px] items-center rounded-full border border-border bg-paper px-2 font-mono text-[10px] tracking-normal text-ink">
              SW Maestro
            </span>
            <span>Project Archive</span>
          </div>

          <h1 className="reveal reveal-2 mt-6 max-w-4xl text-balance text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.98] tracking-tight text-ink-deep">
            소프트웨어 마에스트로
            <br />
            프로젝트 아카이브
          </h1>

          <p className="reveal reveal-3 mt-7 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
            대한민국 최고의 소프트웨어 인재 양성 프로그램,{" "}
            <span className="font-medium text-foreground">
              소프트웨어 마에스트로
            </span>
            의 모든 프로젝트를 한 곳에서. 기수별·분야별로 탐색하고 우수
            프로젝트를 발견해보세요.
          </p>

          <dl className="reveal reveal-4 mt-14 grid max-w-xl grid-cols-3 border-t border-border">
            <Stat label="총 프로젝트" value={projects.length} />
            <Stat label="기수" value={projectGenerations.length} border />
            <Stat label="우수 프로젝트" value={excellentCount} border />
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <ProjectBrowser
          projects={projects}
          types={projectTypes}
          generations={projectGenerations}
        />
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  border,
}: {
  label: string;
  value: number;
  border?: boolean;
}) {
  return (
    <div className={`py-5 ${border ? "border-l border-border pl-5 sm:pl-7" : ""}`}>
      <dd className="font-display nums text-[2.75rem] font-medium leading-none tracking-tight text-ink-deep sm:text-5xl">
        {value}
      </dd>
      <dt className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
    </div>
  );
}
