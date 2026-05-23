import { SiteLayout } from "@/src/layout/SiteLayout";
import { HomePage } from "@/src/pages/HomePage";
import { NotFoundPage } from "@/src/pages/NotFoundPage";
import { ProjectDetailPage } from "@/src/pages/ProjectDetailPage";
import type { Project } from "@/lib/data";

export type HomePageData = {
  page: "home";
  projects: Project[];
  types: string[];
  generations: number[];
};

export type ProjectPageData = {
  page: "project";
  project: Project;
};

export type NotFoundPageData = {
  page: "not-found";
};

export type PageData = HomePageData | ProjectPageData | NotFoundPageData;

export function App({ pageData }: { pageData: PageData }) {
  return (
    <SiteLayout>
      {pageData.page === "home" && (
        <HomePage
          projects={pageData.projects}
          projectTypes={pageData.types}
          projectGenerations={pageData.generations}
        />
      )}
      {pageData.page === "project" && (
        <ProjectDetailPage project={pageData.project} />
      )}
      {pageData.page === "not-found" && <NotFoundPage />}
    </SiteLayout>
  );
}
