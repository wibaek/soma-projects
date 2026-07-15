import { ArrowLeft } from "lucide-react";
import { ProjectSubmissionForm } from "@/components/project-submission-form";

export function SubmitProjectPage() {
  return (
    <main>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
          <a
            href="/"
            className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink-deep"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            프로젝트 목록으로
          </a>

          <div className="mt-10">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brand">
              Software Maestro 17th
            </p>
            <h1 className="mt-4 max-w-3xl text-balance text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.04] tracking-tight text-ink-deep">
              만든 프로젝트를
              <br />
              아카이브에 남겨주세요
            </h1>
            <p className="mt-6 max-w-xl text-[14.5px] leading-relaxed text-muted-foreground">
              기본 정보만 남겨주시면 SOMA Projects 형식에 맞게 정리할게요. 다음
              기수와 동료들이 여러분의 결과물을 더 쉽게 발견할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <ProjectSubmissionForm />
      </section>
    </main>
  );
}
