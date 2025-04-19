import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Project } from "@/lib/data"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg">
        <div className="relative h-48 w-full">
          <Image src={project.imageUrl || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
          {project.rank !== null && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                {project.rank > 0 ? `우수 프로젝트 #${project.rank}` : "우수 프로젝트"}
              </Badge>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              {project.generation}기
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{project.type}</Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-end">
          <span className="text-sm text-muted-foreground">상세 보기 →</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
