"use client";

interface ProjectFilterProps {
  types: string[];
  generations: number[];
  onTypeChange: (type: string | null) => void;
  onGenerationChange: (generation: number | null) => void;
  onExcellentChange: (excellent: boolean) => void;
  selectedType: string | null;
  selectedGeneration: number | null;
  excellentOnly: boolean;
}

export function ProjectFilter({
  types,
  generations,
  onTypeChange,
  onGenerationChange,
  onExcellentChange,
  selectedType,
  selectedGeneration,
  excellentOnly,
}: ProjectFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8 flex-wrap">
      <label className="flex w-full flex-col gap-1 text-sm font-medium text-foreground sm:w-48">
        카테고리
        <select
          value={selectedType ?? ""}
          onChange={(event) => onTypeChange(event.target.value || null)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">모든 카테고리</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="flex w-full flex-col gap-1 text-sm font-medium text-foreground sm:w-48">
        기수
        <select
          value={selectedGeneration ?? ""}
          onChange={(event) =>
            onGenerationChange(
              event.target.value ? Number(event.target.value) : null
            )
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">모든 기수</option>
          {generations.map((generation) => (
            <option key={generation} value={generation}>
              {generation}기
            </option>
          ))}
        </select>
      </label>

      <label className="mt-1 inline-flex h-10 items-center gap-2 rounded-md border border-input px-3 text-sm font-medium">
        <input
          type="checkbox"
          checked={excellentOnly}
          onChange={(event) => onExcellentChange(event.target.checked)}
          className="h-4 w-4"
        />
        우수 프로젝트만 보기
      </label>
    </div>
  );
}
