"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { ProjectFilter } from "@/components/project-filter";
import type { Project } from "@/lib/data";

type ProjectBrowserProps = {
  projects: Project[];
  types: string[];
  generations: number[];
};

export function ProjectBrowser({
  projects,
  types,
  generations,
}: ProjectBrowserProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(
    null
  );
  const [excellentOnly, setExcellentOnly] = useState(false);
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      if (selectedType && project.type !== selectedType) return false;
      if (
        selectedGeneration !== null &&
        project.generation !== selectedGeneration
      )
        return false;
      if (excellentOnly && !project.rank) return false;
      if (normalizedQuery) {
        const haystack = `${project.title} ${project.description}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [excellentOnly, projects, query, selectedGeneration, selectedType]);

  const hasFilters =
    Boolean(selectedType) ||
    selectedGeneration !== null ||
    excellentOnly ||
    query.length > 0;

  function resetFilters() {
    setSelectedType(null);
    setSelectedGeneration(null);
    setExcellentOnly(false);
    setQuery("");
  }

  return (
    <div className="space-y-8">
      <ProjectFilter
        types={types}
        generations={generations}
        onTypeChange={setSelectedType}
        onGenerationChange={setSelectedGeneration}
        onExcellentChange={setExcellentOnly}
        onQueryChange={setQuery}
        onReset={resetFilters}
        selectedType={selectedType}
        selectedGeneration={selectedGeneration}
        excellentOnly={excellentOnly}
        query={query}
        resultCount={filteredProjects.length}
        totalCount={projects.length}
        hasFilters={hasFilters}
      />

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-subtle/30 px-6 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
            <SearchX className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-5 text-lg font-medium tracking-tight">
            결과가 없어요
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            필터와 일치하는 프로젝트가 없습니다. 검색 조건을 조정해 보세요.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-[13px] font-medium transition-colors hover:bg-subtle"
            >
              필터 초기화
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
