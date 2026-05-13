"use client";

import { Search, Sparkles, X, ChevronDown } from "lucide-react";

interface ProjectFilterProps {
  types: string[];
  generations: number[];
  onTypeChange: (type: string | null) => void;
  onGenerationChange: (generation: number | null) => void;
  onExcellentChange: (excellent: boolean) => void;
  onQueryChange: (query: string) => void;
  onReset: () => void;
  selectedType: string | null;
  selectedGeneration: number | null;
  excellentOnly: boolean;
  query: string;
  resultCount: number;
  totalCount: number;
  hasFilters: boolean;
}

export function ProjectFilter({
  types,
  generations,
  onTypeChange,
  onGenerationChange,
  onExcellentChange,
  onQueryChange,
  onReset,
  selectedType,
  selectedGeneration,
  excellentOnly,
  query,
  resultCount,
  totalCount,
  hasFilters,
}: ProjectFilterProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="group relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-ink-deep" />
          <input
            type="search"
            name="q"
            aria-label="프로젝트 검색"
            autoComplete="off"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="프로젝트 이름이나 키워드로 검색"
            className="h-11 w-full rounded-lg border border-border bg-paper pl-10 pr-10 text-[14px] placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="검색어 지우기"
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-subtle hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-muted-foreground">
            <span className="nums font-semibold text-ink-deep">
              {resultCount.toLocaleString()}
            </span>
            <span className="mx-1">/</span>
            <span className="nums">{totalCount.toLocaleString()}</span>
            <span className="ml-1">건</span>
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-[12px] font-medium text-foreground/80 transition-colors hover:bg-subtle hover:text-foreground"
            >
              <X className="h-3 w-3" />
              초기화
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline">
            분야
          </span>
          <Pill
            active={selectedType === null}
            onClick={() => onTypeChange(null)}
          >
            전체
          </Pill>
          {types.map((type) => (
            <Pill
              key={type}
              active={selectedType === type}
              onClick={() => onTypeChange(type)}
            >
              {type}
            </Pill>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <span className="sr-only">기수</span>
            <select
              value={selectedGeneration ?? ""}
              onChange={(event) =>
                onGenerationChange(
                  event.target.value ? Number(event.target.value) : null
                )
              }
              className="h-9 appearance-none rounded-full border border-border bg-background py-0 pl-3.5 pr-9 text-[13px] font-medium text-foreground transition-colors hover:bg-subtle focus:border-brand focus:outline-none"
            >
              <option value="">모든 기수</option>
              {generations.map((generation) => (
                <option key={generation} value={generation}>
                  {generation}기
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </label>

          <label
            className={`inline-flex h-9 cursor-pointer select-none items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors focus-within:ring-2 focus-within:ring-brand/20 focus-within:ring-offset-2 focus-within:ring-offset-background ${
              excellentOnly
                ? "border-accent/35 bg-accent-soft text-ink-deep"
                : "border-border bg-background text-foreground/80 hover:bg-subtle"
            }`}
          >
            <Sparkles
              className={`h-3.5 w-3.5 ${
                excellentOnly ? "text-accent" : "text-muted-foreground"
              }`}
            />
            우수 프로젝트만
            <input
              type="checkbox"
              checked={excellentOnly}
              onChange={(event) => onExcellentChange(event.target.checked)}
              className="sr-only"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium transition-all ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-border bg-background text-foreground/80 hover:border-ink/30 hover:bg-subtle"
      }`}
    >
      {children}
    </button>
  );
}
