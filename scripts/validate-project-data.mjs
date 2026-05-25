import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectsPath = path.join(rootDir, "data", "projects.json");
const allowedTypes = new Set(["App", "Web", "기타"]);

let projects;

try {
  projects = JSON.parse(await readFile(projectsPath, "utf8"));
} catch (error) {
  if (error?.code === "ENOENT") {
    throw new Error(
      "Missing data/projects.json. Run `git submodule update --init --recursive` before building.",
    );
  }

  throw error;
}

const errors = [];
const ids = new Set();

if (!Array.isArray(projects)) {
  errors.push("data/projects.json must contain a JSON array.");
} else {
  projects.forEach((project, index) => validateProject(project, index));
}

if (errors.length > 0) {
  const shown = errors.slice(0, 30).map((error) => `- ${error}`).join("\n");
  const hidden = errors.length > 30 ? `\n...and ${errors.length - 30} more` : "";
  throw new Error(`Invalid project data:\n${shown}${hidden}`);
}

process.stdout.write(
  `Project data verified: ${projects.length} projects in data/projects.json.\n`,
);

function validateProject(project, index) {
  const label = `project[${index}]`;

  if (!project || typeof project !== "object" || Array.isArray(project)) {
    errors.push(`${label} must be an object.`);
    return;
  }

  validateRequiredString(project.id, `${label}.id`);
  validateRequiredString(project.title, `${label}.title`);
  validateRequiredString(project.description, `${label}.description`);

  if (typeof project.id === "string") {
    if (project.id.trim() !== project.id || /[/?#]/.test(project.id)) {
      errors.push(`${label}.id must be a single URL path segment.`);
    }

    if (ids.has(project.id)) {
      errors.push(`${label}.id is duplicated: ${project.id}`);
    }

    ids.add(project.id);
  }

  if (!Number.isInteger(project.generation) || project.generation <= 0) {
    errors.push(`${label}.generation must be a positive integer.`);
  }

  validateOptionalLinks(project.link, `${label}.link`);
  validateOptionalLinkArray(project.links, `${label}.links`);
  validateOptionalString(project.imageUrl, `${label}.imageUrl`);
  validateOptionalString(project.createdAt, `${label}.createdAt`);

  if (
    project.rank !== undefined &&
    project.rank !== null &&
    typeof project.rank !== "boolean"
  ) {
    errors.push(`${label}.rank must be a boolean when present.`);
  }

  if (project.type !== undefined) {
    validateOptionalString(project.type, `${label}.type`);

    if (typeof project.type === "string" && !allowedTypes.has(project.type)) {
      errors.push(`${label}.type must be one of App, Web, 기타.`);
    }
  }
}

function validateRequiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${field} must be a non-empty string.`);
  }
}

function validateOptionalString(value, field) {
  if (value !== undefined && value !== null && typeof value !== "string") {
    errors.push(`${field} must be a string when present.`);
  }
}

function validateOptionalLinks(value, field) {
  validateOptionalString(value, field);

  if (typeof value !== "string" || value.trim() === "") {
    return;
  }

  value
    .split(/\s*\|\s*/)
    .map((url) => url.trim())
    .forEach((url, index) => validateHttpUrl(url, `${field}[${index}]`));
}

function validateOptionalLinkArray(value, field) {
  if (value === undefined || value === null) {
    return;
  }

  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array when present.`);
    return;
  }

  value.forEach((url, index) => {
    if (typeof url !== "string" || url.trim() === "") {
      errors.push(`${field}[${index}] must be a non-empty string.`);
      return;
    }

    validateHttpUrl(url, `${field}[${index}]`);
  });
}

function validateHttpUrl(value, field) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      errors.push(`${field} must be an http or https URL.`);
    }
  } catch {
    errors.push(`${field} must be a valid URL.`);
  }
}
