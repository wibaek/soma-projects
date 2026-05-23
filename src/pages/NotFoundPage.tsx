export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[55vh] max-w-6xl flex-col justify-center px-5 py-20 sm:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-deep sm:text-5xl">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        요청한 프로젝트나 페이지가 존재하지 않습니다. 프로젝트 목록에서 다시
        탐색해 주세요.
      </p>
      <a
        href="/"
        className="mt-8 inline-flex h-10 w-fit items-center rounded-md bg-ink px-4 text-[14px] font-medium text-paper transition-colors hover:bg-ink-deep"
      >
        프로젝트 목록으로
      </a>
    </main>
  );
}
