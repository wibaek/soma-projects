import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { type Project } from "@/lib/data";

interface ProjectPageProps {
  project: Project;
}

export default function ProjectPage({ project }: ProjectPageProps) {
  return (
    <main className="container mx-auto py-8 px-4">
      <Link
        href="/"
        className="mb-6 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        프로젝트 목록으로 돌아가기
      </Link>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.type && (
                <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                  {project.type}
                </span>
              )}
              <span className="rounded-full border px-2 py-1 text-xs font-medium">
                {project.generation}기
              </span>
              {project.rank && (
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                  우수 프로젝트
                </span>
              )}
            </div>
          </div>

          <section className="rounded-lg border bg-card p-6">
            <MarkdownRenderer content={project.description} />
          </section>
        </div>

        <div className="space-y-6">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={project.imageUrl || "/placeholder.svg"}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">프로젝트 상세 정보</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">기수:</span>
                <p>{project.generation}기</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  프로젝트 유형:
                </span>
                <p>{project.type || "미분류"}</p>
              </div>
              {project.rank && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    우수 프로젝트 여부:
                  </span>
                  <p>우수</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">
                  프로젝트 링크:
                </span>
                <p>
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      프로젝트 방문하기
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  ) : (
                    <span>미제공</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
