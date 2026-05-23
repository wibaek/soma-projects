import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectsPath = path.join(rootDir, "data", "projects.json");
const concurrency = 12;
const timeoutMs = 12000;
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      redirect: "follow",
      ...options,
      headers: {
        "user-agent": userAgent,
        accept: "image/*,*/*;q=0.8",
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function validate(project) {
  try {
    let response = await fetchWithTimeout(project.imageUrl, { method: "HEAD" });
    let contentType = response.headers.get("content-type") ?? "";

    if (!response.ok || !contentType.toLowerCase().startsWith("image/")) {
      response = await fetchWithTimeout(project.imageUrl, {
        method: "GET",
        headers: { range: "bytes=0-2047" },
      });
      contentType = response.headers.get("content-type") ?? "";
    }

    const ok = response.ok && contentType.toLowerCase().startsWith("image/");
    return {
      id: project.id,
      imageUrl: project.imageUrl,
      ok,
      status: response.status,
      contentType,
    };
  } catch (error) {
    return {
      id: project.id,
      imageUrl: project.imageUrl,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (index < items.length) {
        const currentIndex = index;
        index += 1;
        results[currentIndex] = await mapper(items[currentIndex]);
      }
    }),
  );

  return results;
}

const projects = JSON.parse(await readFile(projectsPath, "utf8")).filter(
  (project) => project.imageUrl,
);
const results = await mapLimit(projects, concurrency, validate);
const failures = results.filter((result) => !result.ok);

process.stdout.write(
  `${JSON.stringify(
    {
      checked: results.length,
      failed: failures.length,
      failures,
    },
    null,
    2,
  )}\n`,
);
