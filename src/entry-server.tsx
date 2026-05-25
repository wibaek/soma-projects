import { renderToString } from "react-dom/server";
import { App, type PageData } from "@/src/App";
import {
  getProjectById,
  getProjectGenerations,
  getProjectMetadataDescription,
  getProjects,
  getProjectTypes,
} from "@/lib/data";

export const SITE_URL = "https://swmaestroproject.org";
export const SITE_NAME = "SOMA Projects";
export const HOME_TITLE =
  "SOMA Projects - 소프트웨어 마에스트로 프로젝트 아카이브";
export const HOME_DESCRIPTION =
  "소프트웨어 마에스트로 프로그램의 모든 프로젝트를 한 곳에서. 기수별·분야별로 탐색하고, 우수 프로젝트를 한눈에 확인하세요.";
export const DEFAULT_OG_IMAGE = "/placeholder.svg";

export type PageMeta = {
  title: string;
  description: string;
  path: string;
  image: string;
  type: "website" | "article";
};

export type StaticRoute = {
  path: string;
  data: PageData;
  meta: PageMeta;
  includeInSitemap: boolean;
};

export function getStaticRoutes(): StaticRoute[] {
  const projects = getProjects();
  const homeData: PageData = {
    page: "home",
    projects,
    types: getProjectTypes(),
    generations: getProjectGenerations(),
  };

  const routes: StaticRoute[] = [
    {
      path: "/",
      data: homeData,
      meta: {
        title: HOME_TITLE,
        description: HOME_DESCRIPTION,
        path: "/",
        image: DEFAULT_OG_IMAGE,
        type: "website",
      },
      includeInSitemap: true,
    },
  ];

  for (const project of projects) {
    const path = `/projects/${project.id}/`;
    routes.push({
      path,
      data: {
        page: "project",
        project,
      },
      meta: {
        title: `${project.title} - SOMA Projects`,
        description: getProjectMetadataDescription(project),
        path,
        image: project.imageUrl || DEFAULT_OG_IMAGE,
        type: "article",
      },
      includeInSitemap: true,
    });
  }

  routes.push({
    path: "/404.html",
    data: {
      page: "not-found",
    },
    meta: {
      title: "페이지를 찾을 수 없습니다 - SOMA Projects",
      description: "요청한 페이지를 찾을 수 없습니다.",
      path: "/404.html",
      image: DEFAULT_OG_IMAGE,
      type: "website",
    },
    includeInSitemap: false,
  });

  return routes;
}

export function getRouteByPath(path: string): StaticRoute | null {
  if (path === "/") {
    return getStaticRoutes()[0] ?? null;
  }

  const projectMatch = path.match(/^\/projects\/([^/]+)\/?$/);
  if (!projectMatch) {
    return null;
  }

  const project = getProjectById(projectMatch[1]);
  if (!project) {
    return null;
  }

  const routePath = `/projects/${project.id}/`;
  return {
    path: routePath,
    data: {
      page: "project",
      project,
    },
    meta: {
      title: `${project.title} - SOMA Projects`,
      description: getProjectMetadataDescription(project),
      path: routePath,
      image: project.imageUrl || DEFAULT_OG_IMAGE,
      type: "article",
    },
    includeInSitemap: true,
  };
}

export function renderPage(data: PageData): string {
  return renderToString(<App pageData={data} />);
}
