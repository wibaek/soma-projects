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
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-24">
          <h1 className="max-w-4xl text-balance text-[clamp(2.25rem,5.6vw,4.75rem)] font-bold leading-[1] tracking-tight text-ink-deep">
            소프트웨어 마에스트로
            <br />
            프로젝트 아카이브
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
            대한민국 최고의 소프트웨어 인재 양성 프로그램,{" "}
            <span className="text-foreground">소프트웨어 마에스트로</span>의
            모든 프로젝트를 한 곳에서. 기수별·분야별로 탐색하고 우수
            프로젝트를 발견해보세요.
          </p>

          <dl className="mt-12 grid max-w-2xl grid-cols-3 border-t border-border">
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
    <div
      className={`py-6 ${border ? "border-l border-border pl-5 sm:pl-7" : ""}`}
    >
      <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 flex items-baseline gap-1">
        <span className="nums text-3xl font-semibold tracking-tight text-ink-deep sm:text-4xl">
          {value}
        </span>
      </dd>
    </div>
  );
}
