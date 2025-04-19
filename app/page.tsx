"use client"

import { useState, useEffect } from "react"
import { ProjectCard } from "@/components/project-card"
import { ProjectFilter } from "@/components/project-filter"
import { getFilteredProjects, getProjectTypes, getProjectGenerations, type Project } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectTypes, setProjectTypes] = useState<string[]>([])
  const [projectGenerations, setProjectGenerations] = useState<number[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null)
  const [excellentOnly, setExcellentOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  // 필터 옵션 로드
  useEffect(() => {
    const loadFilterOptions = async () => {
      const types = await getProjectTypes()
      const generations = await getProjectGenerations()
      setProjectTypes(types)
      setProjectGenerations(generations)
    }

    loadFilterOptions()
  }, [])

  // 프로젝트 로드
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      const filteredProjects = await getFilteredProjects(selectedType, selectedGeneration, excellentOnly)
      setProjects(filteredProjects)
      setLoading(false)
    }

    loadProjects()
  }, [selectedType, selectedGeneration, excellentOnly])

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">소프트웨어 마에스트로 프로젝트</h1>
        <p className="text-muted-foreground">소프트웨어 마에스트로 프로그램의 혁신적인 프로젝트 탐색</p>
      </div>

      <ProjectFilter
        types={projectTypes}
        generations={projectGenerations}
        onTypeChange={setSelectedType}
        onGenerationChange={setSelectedGeneration}
        onExcellentChange={setExcellentOnly}
        selectedType={selectedType}
        selectedGeneration={selectedGeneration}
        excellentOnly={excellentOnly}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">필터와 일치하는 프로젝트가 없습니다. 검색 조건을 조정해 보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  )
}
