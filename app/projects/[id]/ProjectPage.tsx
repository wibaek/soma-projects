"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { type Project } from "@/lib/data";

interface ProjectPageProps {
  project: Project | null;
}

export default function ProjectPage({ project }: ProjectPageProps) {
  const router = useRouter();

  if (!project) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">프로젝트를 찾을 수 없습니다</h1>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          프로젝트 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.push("/")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        프로젝트 목록으로 돌아가기
      </Button>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge>{project.type}</Badge>
              <Badge variant="outline">{project.generation}기</Badge>
              {project.rank && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  우수 프로젝트
                </Badge>
              )}
            </div>
          </div>

          <Card className="p-6">
            <MarkdownRenderer content={project.description} />
          </Card>
        </div>

        <div className="space-y-6">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={project.imageUrl || "/placeholder.svg"}
              alt={project.title}
              fill
              className="object-cover"
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
                <p>{project.type}</p>
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
