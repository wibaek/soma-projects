import { createRoot, hydrateRoot } from "react-dom/client";
import { App, type PageData } from "@/src/App";
import "@/src/styles/globals.css";

declare global {
  interface Window {
    __SOMA_PAGE_DATA__?: PageData;
  }
}

const root = document.getElementById("root");
const injectedPageData = window.__SOMA_PAGE_DATA__;

void mount();

async function mount() {
  if (root && injectedPageData) {
    hydrateRoot(root, <App pageData={injectedPageData} />);
  } else if (root && import.meta.env.DEV) {
    const pageData = await getDevPageDataFromLocation();
    createRoot(root).render(<App pageData={pageData} />);
  }
}

async function getDevPageDataFromLocation(): Promise<PageData> {
  const {
    getProjectById,
    getProjectGenerations,
    getProjects,
    getProjectTypes,
  } = await import("@/lib/data");

  const projectMatch = window.location.pathname.match(
    /^\/projects\/([^/]+)\/?$/
  );

  if (projectMatch) {
    const project = getProjectById(projectMatch[1]);

    if (project) {
      return {
        page: "project",
        project,
      };
    }

    return {
      page: "not-found",
    };
  }

  if (window.location.pathname === "/" || window.location.pathname === "") {
    return {
      page: "home",
      projects: getProjects(),
      types: getProjectTypes(),
      generations: getProjectGenerations(),
    };
  }

  return {
    page: "not-found",
  };
}
