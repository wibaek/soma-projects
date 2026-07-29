export function NotFoundPage() {
  return (
    <main className="relative isolate flex min-h-[62vh] items-center overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-dots opacity-50 mask-radial" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <p className="font-display text-[clamp(5rem,20vw,13rem)] font-medium leading-none tracking-tight text-ink-deep/90">
          404
        </p>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink-deep sm:text-3xl">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          요청한 프로젝트나 페이지가 존재하지 않습니다. 프로젝트 목록에서 다시
          탐색해 주세요.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex h-10 w-fit items-center rounded-full bg-ink px-5 text-[14px] font-medium text-paper shadow-sm transition-colors hover:bg-ink-deep"
        >
          프로젝트 목록으로
        </a>
      </div>
    </main>
  );
}
