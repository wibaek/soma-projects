import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SITE_NAME,
  SITE_URL,
  getStaticRoutes,
  renderPage,
} from "../.ssg/server/entry-server.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(rootDir, "out");
const manifestPath = path.join(outDir, ".vite", "manifest.json");
const analyticsId = "G-4T61K4G2VE";

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const entry = Object.values(manifest).find((chunk) => chunk.isEntry);

if (!entry) {
  throw new Error("Vite manifest does not contain a client entry chunk.");
}

await rm(path.join(outDir, "index.html"), { force: true });

const assetTags = buildAssetTags(entry, manifest);
const routes = getStaticRoutes();

for (const route of routes) {
  const html = buildHtml({
    appHtml: renderPage(route.data),
    pageData: route.data,
    meta: route.meta,
    assetTags,
  });

  const filePath = outputPathForRoute(route.path);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html);
}

await writeFile(path.join(outDir, "sitemap.xml"), buildSitemap(routes));
await writeFile(path.join(outDir, "robots.txt"), buildRobots());
await rm(path.join(outDir, ".vite"), { recursive: true, force: true });

function buildAssetTags(entryChunk, manifest) {
  const css = collectCss(entryChunk, manifest)
    .map(
      (file) =>
        `<link rel="stylesheet" crossorigin href="/${escapeAttribute(file)}">`
    )
    .join("\n    ");

  const modulePreloads = collectImports(entryChunk, manifest)
    .map(
      (file) =>
        `<link rel="modulepreload" crossorigin href="/${escapeAttribute(file)}">`
    )
    .join("\n    ");

  const script = `<script type="module" crossorigin src="/${escapeAttribute(
    entryChunk.file
  )}"></script>`;

  return [css, modulePreloads, script].filter(Boolean).join("\n    ");
}

function collectCss(chunk, manifest, seen = new Set()) {
  const files = new Set(chunk.css ?? []);

  for (const importKey of chunk.imports ?? []) {
    if (seen.has(importKey)) continue;
    seen.add(importKey);
    const imported = manifest[importKey];
    if (!imported) continue;
    for (const file of collectCss(imported, manifest, seen)) {
      files.add(file);
    }
  }

  return Array.from(files);
}

function collectImports(chunk, manifest, seen = new Set()) {
  const files = [];

  for (const importKey of chunk.imports ?? []) {
    if (seen.has(importKey)) continue;
    seen.add(importKey);
    const imported = manifest[importKey];
    if (!imported) continue;
    files.push(imported.file, ...collectImports(imported, manifest, seen));
  }

  return files;
}

function buildHtml({ appHtml, pageData, meta, assetTags }) {
  const canonicalUrl = absoluteUrl(meta.path);
  const metaImageUrl = absoluteImageUrl(meta.image);
  const serializedData = JSON.stringify(pageData).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeAttribute(meta.description)}">
    <meta name="application-name" content="${escapeAttribute(SITE_NAME)}">
    <link rel="canonical" href="${escapeAttribute(canonicalUrl)}">
    <meta property="og:site_name" content="${escapeAttribute(SITE_NAME)}">
    <meta property="og:type" content="${escapeAttribute(meta.type)}">
    <meta property="og:title" content="${escapeAttribute(meta.title)}">
    <meta property="og:description" content="${escapeAttribute(
      meta.description
    )}">
    <meta property="og:url" content="${escapeAttribute(canonicalUrl)}">
    <meta property="og:image" content="${escapeAttribute(metaImageUrl)}">
    <meta property="og:image:alt" content="${escapeAttribute(meta.title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeAttribute(meta.title)}">
    <meta name="twitter:description" content="${escapeAttribute(
      meta.description
    )}">
    <meta name="twitter:image" content="${escapeAttribute(metaImageUrl)}">
    <script async src="https://www.googletagmanager.com/gtag/js?id=${analyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${analyticsId}');
    </script>
    ${assetTags}
  </head>
  <body class="min-h-screen bg-background text-foreground">
    <div id="root">${appHtml}</div>
    <script>window.__SOMA_PAGE_DATA__=${serializedData};</script>
  </body>
</html>
`;
}

function buildSitemap(routes) {
  const urls = routes
    .filter((route) => route.includeInSitemap)
    .map((route) => {
      const priority = route.path === "/" ? "1.0" : "0.7";
      const changeFrequency = route.path === "/" ? "daily" : "weekly";

      return `  <url>
    <loc>${escapeHtml(absoluteUrl(route.path))}</loc>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function outputPathForRoute(routePath) {
  if (routePath === "/404.html") {
    return path.join(outDir, "404.html");
  }

  if (routePath === "/") {
    return path.join(outDir, "index.html");
  }

  const segments = routePath.replace(/^\/|\/$/g, "");
  return path.join(outDir, segments, "index.html");
}

function absoluteUrl(routePath) {
  if (routePath === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${routePath}`;
}

function absoluteImageUrl(imageUrl) {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${SITE_URL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
