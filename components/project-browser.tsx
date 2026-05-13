"use client";

import { useMemo, useState } from "react";
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

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (selectedType && project.type !== selectedType) {
          return false;
        }

        if (
          selectedGeneration !== null &&
          project.generation !== selectedGeneration
        ) {
          return false;
        }

        if (excellentOnly && !project.rank) {
          return false;
        }

        return true;
      }),
    [excellentOnly, projects, selectedGeneration, selectedType]
  );

  return (
    <>
      <ProjectFilter
        types={types}
        generations={generations}
        onTypeChange={setSelectedType}
        onGenerationChange={setSelectedGeneration}
        onExcellentChange={setExcellentOnly}
        selectedType={selectedType}
        selectedGeneration={selectedGeneration}
        excellentOnly={excellentOnly}
      />

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            필터와 일치하는 프로젝트가 없습니다. 검색 조건을 조정해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
