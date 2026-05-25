import projectsData from "../data/projects.json";

const DEFAULT_PROJECT_TYPE = "기타";
const PROJECT_TYPE_ORDER = ["App", "Web", DEFAULT_PROJECT_TYPE];

export type Project = {
  id: string;
  title: string;
  link: string;
  links: ProjectLink[];
  description: string;
  imageUrl: string;
  rank: boolean;
  type: string;
  generation: number;
  createdAt?: string;
};

export type ProjectLink = {
  url: string;
  label: string;
};

type RawProject = {
  id: string;
  title: string;
  link?: string;
  links?: string[];
  description: string;
  imageUrl?: string;
  rank?: boolean | null;
  type?: string;
  generation: number;
  createdAt?: string;
};

function normalizeProject(project: RawProject): Project {
  const links = parseProjectLinks([project.link, ...(project.links ?? [])]);

  const normalized: Project = {
    id: project.id,
    title: project.title,
    link: links[0]?.url ?? "",
    links,
    description: project.description,
    imageUrl: project.imageUrl ?? "",
    rank: project.rank === true,
    type: project.type?.trim() || DEFAULT_PROJECT_TYPE,
    generation: project.generation,
  };

  if (project.createdAt) {
    normalized.createdAt = project.createdAt;
  }

  return normalized;
}

function parseProjectLinks(linkValues: (string | undefined)[]): ProjectLink[] {
  const seen = new Set<string>();

  return linkValues
    .flatMap((link) => link?.split(/\s*\|\s*/) ?? [])
    .map((url) => url.trim())
    .filter(Boolean)
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    })
    .map((url, index) => ({
      url,
      label: formatLinkLabel(url, index),
    }));
}

function formatLinkLabel(url: string, index: number): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return `링크 ${index + 1}`;
  }
}

const projects = (projectsData as RawProject[])
  .map(normalizeProject)
  .sort((a, b) => b.generation - a.generation || a.title.localeCompare(b.title));

export function getProjects(): Project[] {
  return projects;
}

export function getProjectById(id: string): Project | null {
  return projects.find((project) => project.id === id) ?? null;
}

export function getProjectTypes(): string[] {
  return Array.from(
    new Set(projects.map((project) => project.type))
  ).sort(
    (a, b) =>
      typeSortIndex(a) - typeSortIndex(b) || a.localeCompare(b, "ko")
  );
}

function typeSortIndex(type: string): number {
  const index = PROJECT_TYPE_ORDER.indexOf(type);
  return index === -1 ? PROJECT_TYPE_ORDER.length : index;
}

export function getProjectGenerations(): number[] {
  return Array.from(new Set(projects.map((project) => project.generation))).sort(
    (a, b) => b - a
  );
}

export function getProjectMetadataDescription(project: Project): string {
  return project.description
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#*_`>-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}
