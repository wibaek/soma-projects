import { ProjectBrowser } from "@/components/project-browser";
import {
  getProjectGenerations,
  getProjects,
  getProjectTypes,
} from "@/lib/data";

export default function Home() {
  const projects = getProjects();
  const projectTypes = getProjectTypes();
  const projectGenerations = getProjectGenerations();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">SW마에스트로 프로젝트</h1>
        <p className="text-muted-foreground">
          소프트웨어 마에스트로 프로그램의 프로젝트를 쉽게 탐색하세요
        </p>
      </div>

      <ProjectBrowser
        projects={projects}
        types={projectTypes}
        generations={projectGenerations}
      />
    </main>
  );
}
