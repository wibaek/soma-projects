import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/data";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <article className="h-full overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
        <div className="relative h-48 w-full">
          <Image
            src={project.imageUrl || "/placeholder.svg"}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          {project.rank && (
            <div className="absolute top-2 right-2">
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                우수 프로젝트
              </span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="rounded-full border bg-white/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
              {project.generation}기
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
          {project.type && (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border px-2 py-1 text-xs font-medium">
                {project.type}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-end p-4 pt-0">
          <span className="text-sm text-muted-foreground">상세 보기 →</span>
        </div>
      </article>
    </Link>
  );
}
