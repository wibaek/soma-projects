import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(rootDir, "out");
const siteUrl = "https://swmaestroproject.org";
const projects = JSON.parse(
  await readFile(path.join(rootDir, "data", "projects.json"), "utf8")
);

const sampleProject =
  projects.find((project) => project.id === "16-aisc") ?? projects[0];

assert(sampleProject, "No projects found in data/projects.json.");

await assertFile("index.html");
await assertFile("404.html");
await assertFile("sitemap.xml");
await assertFile("robots.txt");

for (const project of projects) {
  await assertFile(path.join("projects", project.id, "index.html"));
}

const homeHtml = await readOutput("index.html");
assertIncludes(
  homeHtml,
  "<h1",
  "Home page must contain prerendered heading markup."
);
assertIncludes(
  homeHtml,
  "소프트웨어 마에스트로",
  "Home page must contain prerendered Korean content."
);
assertIncludes(
  homeHtml,
  '<meta name="description"',
  "Home page must contain a meta description."
);
assertIncludes(
  homeHtml,
  `<link rel="canonical" href="${siteUrl}">`,
  "Home page must contain the canonical URL."
);

const sampleHtml = await readOutput(
  path.join("projects", sampleProject.id, "index.html")
);
assertIncludes(
  sampleHtml,
  `<link rel="canonical" href="${siteUrl}/projects/${sampleProject.id}/">`,
  "Project page must contain the canonical URL."
);
assertIncludes(
  sampleHtml,
  escapeHtml(sampleProject.title),
  "Project page must contain the prerendered project title."
);
assertIncludes(
  sampleHtml,
  '<meta name="description"',
  "Project page must contain a meta description."
);

const sitemap = await readOutput("sitemap.xml");
const sitemapUrls = sitemap.match(/<loc>/g)?.length ?? 0;
assert(
  sitemapUrls === projects.length + 1,
  `Sitemap should contain ${projects.length + 1} URLs, found ${sitemapUrls}.`
);
assertIncludes(
  sitemap,
  `${siteUrl}/projects/${sampleProject.id}/`,
  "Sitemap must contain a project detail URL."
);

const robots = await readOutput("robots.txt");
assertIncludes(
  robots,
  `Sitemap: ${siteUrl}/sitemap.xml`,
  "Robots file must point to sitemap.xml."
);

process.stdout.write(
  `Static output verified: ${projects.length} project pages, sitemap, robots, SEO tags.\n`
);

async function assertFile(relativePath) {
  try {
    await access(path.join(outDir, relativePath));
  } catch {
    throw new Error(`Missing output file: out/${relativePath}`);
  }
}

async function readOutput(relativePath) {
  return readFile(path.join(outDir, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(source, expected, message) {
  assert(source.includes(expected), message);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
