import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/data";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

const PLAIN_TEXT_LIMIT = 110;

function plainPreview(markdown: string, title: string): string {
  const stripped = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*_`>~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const withoutTitle = stripped.startsWith(title)
    ? stripped.slice(title.length).replace(/^[\s\-—–·:]+/, "")
    : stripped;

  const clean = withoutTitle.trim();
  if (!clean) return "";
  if (clean.length <= PLAIN_TEXT_LIMIT) return clean;
  return clean.slice(0, PLAIN_TEXT_LIMIT).replace(/\s+\S*$/, "") + "…";
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const preview = plainPreview(project.description, project.title);
  const hasImage = Boolean(project.imageUrl);

  return (
    <a
      href={`/projects/${project.id}/`}
      className="card-hover reveal group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs"
      style={{ animationDelay: `${Math.min(index, 9) * 0.04}s` }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border bg-subtle">
        {hasImage ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="card-image h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <NoImage type={project.type} />
        )}

        {project.rank && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-medium text-ink-deep shadow-sm ring-1 ring-border/70 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            우수 프로젝트
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {project.type && <span>{project.type}</span>}
          {project.type && <span className="text-border">/</span>}
          <span className="font-mono normal-case tracking-tight">
            {project.generation}기
          </span>
        </div>

        <h3 className="mt-2.5 text-[16.5px] font-semibold leading-snug tracking-tight text-ink-deep transition-colors group-hover:text-brand">
          {project.title}
        </h3>

        {preview && (
          <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-muted-foreground">
            {preview}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-[12px] font-medium text-muted-foreground transition-colors group-hover:text-ink-deep">
            자세히 보기
          </span>
          <ArrowUpRight className="arrow-mover h-3.5 w-3.5 text-muted-foreground group-hover:text-brand" />
        </div>
      </div>
    </a>
  );
}

function NoImage({ type }: { type: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-subtle bg-dots">
      <span className="rounded-full border border-border bg-paper/70 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm">
        {type || "Project"}
      </span>
    </div>
  );
}
