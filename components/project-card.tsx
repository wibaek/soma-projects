import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/data";

interface ProjectCardProps {
  project: Project;
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

export function ProjectCard({ project }: ProjectCardProps) {
  const preview = plainPreview(project.description, project.title);
  const hasImage = Boolean(project.imageUrl);

  return (
    <a
      href={`/projects/${project.id}/`}
      className="card-hover group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card"
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
          <NoImage title={project.title} type={project.type} />
        )}

        {project.rank && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-[11px] font-medium text-ink-deep shadow-sm">
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

        <h3 className="mt-2.5 text-[16.5px] font-semibold leading-snug tracking-tight text-ink-deep">
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
          <ArrowUpRight className="arrow-mover h-3.5 w-3.5 text-muted-foreground group-hover:text-ink-deep" />
        </div>
      </div>
    </a>
  );
}

function NoImage({ type }: { title: string; type: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70">
        {type || "Project"}
      </span>
    </div>
  );
}
