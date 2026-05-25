import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectsPath = path.join(rootDir, "data", "projects.json");
const outIndex = process.argv.indexOf("--out");
const outputPath = outIndex >= 0 ? process.argv[outIndex + 1] : null;

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const timeoutMs = 12000;
const concurrency = 8;

const metaImageKeys = new Set([
  "og:image",
  "og:image:url",
  "og:image:secure_url",
  "twitter:image",
  "twitter:image:src",
  "thumbnail",
]);

const imageExtensions = /\.(png|jpe?g|webp|gif)(?:[?#].*)?$/i;

function htmlDecode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\u002F/g, "/")
    .replace(/\\\//g, "/")
    .replace(/\\u003D/gi, "=")
    .replace(/\\u0026/g, "&");
}

function splitLinks(link) {
  if (!link) return [];
  return link
    .split(/\s*\|\s*/)
    .map((item) => item.trim())
    .filter((item) => item.startsWith("http://") || item.startsWith("https://"));
}

function getProjectLinks(project) {
  const links = [
    ...splitLinks(project.link),
    ...(Array.isArray(project.links) ? project.links : []),
  ];
  return Array.from(new Set(links));
}

function normalizeUrl(value, baseUrl) {
  if (!value) return null;

  const cleaned = htmlDecode(value)
    .trim()
    .replace(/^url\(["']?/, "")
    .replace(/["']?\)$/, "")
    .replace(/^["']|["']$/g, "");

  if (!cleaned || cleaned.startsWith("data:")) return null;

  try {
    if (cleaned.startsWith("//")) {
      const base = new URL(baseUrl);
      return `${base.protocol}${cleaned}`;
    }

    return new URL(cleaned, baseUrl).toString();
  } catch {
    return null;
  }
}

function parseAttrs(tag) {
  const attrs = new Map();
  const attrPattern = /([a-zA-Z_:.-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;

  while ((match = attrPattern.exec(tag)) !== null) {
    attrs.set(match[1].toLowerCase(), htmlDecode(match[3] ?? match[4] ?? match[5] ?? ""));
  }

  return attrs;
}

function parseMetaImages(html, baseUrl) {
  const candidates = [];
  const metaPattern = /<meta\b[^>]*>/gi;
  let match;

  while ((match = metaPattern.exec(html)) !== null) {
    const attrs = parseAttrs(match[0]);
    const key = (attrs.get("property") ?? attrs.get("name") ?? attrs.get("itemprop") ?? "").toLowerCase();
    const content = attrs.get("content");

    if (!content || !metaImageKeys.has(key)) continue;

    const imageUrl = normalizeUrl(content, baseUrl);
    if (!imageUrl) continue;

    candidates.push({
      imageUrl,
      score: scoreImageUrl(imageUrl, 82),
      strategy: key,
      reason: `${key} 메타 이미지`,
    });
  }

  return candidates;
}

function parseImageTags(html, baseUrl) {
  const candidates = [];
  const imgPattern = /<(img|source|link)\b[^>]*>/gi;
  let match;

  while ((match = imgPattern.exec(html)) !== null) {
    const attrs = parseAttrs(match[0]);
    const values = [
      attrs.get("src"),
      attrs.get("data-src"),
      attrs.get("data-original"),
      attrs.get("href"),
      ...parseSrcSet(attrs.get("srcset")),
      ...parseSrcSet(attrs.get("data-srcset")),
    ].filter(Boolean);

    for (const value of values) {
      const imageUrl = normalizeUrl(value, baseUrl);
      if (!imageUrl || !looksLikeImageUrl(imageUrl)) continue;

      candidates.push({
        imageUrl,
        score: scoreImageUrl(imageUrl, 58),
        strategy: "html-image",
        reason: "공식 페이지 내 이미지",
      });
    }
  }

  return candidates;
}

function parseSrcSet(srcset) {
  if (!srcset) return [];
  return srcset
    .split(",")
    .map((item) => item.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function looksLikeImageUrl(url) {
  const lower = url.toLowerCase();
  return (
    imageExtensions.test(lower) ||
    lower.includes("image") ||
    lower.includes("googleusercontent.com") ||
    lower.includes("mzstatic.com") ||
    lower.includes("ytimg.com")
  );
}

function scoreImageUrl(url, baseScore) {
  const lower = url.toLowerCase();
  let score = baseScore;

  if (lower.includes("favicon") || lower.includes("apple-touch-icon")) score -= 45;
  if (lower.includes("logo")) score -= 18;
  if (lower.includes("avatar")) score -= 18;
  if (lower.includes("badge") || lower.includes("shields.io") || lower.includes("codecov")) score -= 65;
  if (lower.includes("screenshot") || lower.includes("screen") || lower.includes("mockup")) score += 12;
  if (lower.includes("hero") || lower.includes("landing")) score += 7;
  if (lower.includes("1200x630") || lower.includes("w1200")) score += 5;

  const sizeMatch = lower.match(/[=_/-](?:w|s|width)?(\d{3,5})[x-](?:h|height)?(\d{3,5})/);
  if (sizeMatch) {
    const width = Number(sizeMatch[1]);
    const height = Number(sizeMatch[2]);
    if (width >= 500 && height >= 250) score += 10;
    if (width < 240 || height < 160) score -= 30;
  }

  return score;
}

function dedupeCandidates(candidates) {
  const byUrl = new Map();

  for (const candidate of candidates) {
    const existing = byUrl.get(candidate.imageUrl);
    if (!existing || candidate.score > existing.score) {
      byUrl.set(candidate.imageUrl, candidate);
    }
  }

  return Array.from(byUrl.values()).sort((a, b) => b.score - a.score);
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      redirect: "follow",
      ...options,
      headers: {
        "user-agent": userAgent,
        accept: options.accept ?? "*/*",
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url) {
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.text();
}

async function validateImageUrl(imageUrl) {
  try {
    let response = await fetchWithTimeout(imageUrl, {
      method: "HEAD",
      headers: { accept: "image/*,*/*;q=0.8" },
    });

    let contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.toLowerCase().startsWith("image/")) {
      response = await fetchWithTimeout(imageUrl, {
        method: "GET",
        headers: {
          accept: "image/*,*/*;q=0.8",
          range: "bytes=0-2047",
        },
      });
      contentType = response.headers.get("content-type") ?? "";
    }

    return {
      ok: response.ok && contentType.toLowerCase().startsWith("image/"),
      contentType,
    };
  } catch (error) {
    return {
      ok: false,
      contentType: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function appStoreId(url) {
  return url.match(/\/id(\d+)/)?.[1] ?? null;
}

function appStoreCountry(url) {
  return url.match(/apps\.apple\.com\/([a-z]{2})\//i)?.[1]?.toLowerCase() ?? "kr";
}

async function collectAppStore(project, sourceUrl) {
  const id = appStoreId(sourceUrl);
  if (!id) return collectPage(project, sourceUrl);

  const country = appStoreCountry(sourceUrl);
  const lookupUrl = `https://itunes.apple.com/lookup?id=${id}&country=${country}`;
  const response = await fetchWithTimeout(lookupUrl, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) return collectPage(project, sourceUrl);

  const payload = await response.json();
  const item = payload.results?.[0];
  if (!item) return collectPage(project, sourceUrl);

  const screenshotUrl =
    item.screenshotUrls?.[0] ??
    item.ipadScreenshotUrls?.[0] ??
    item.artworkUrl512 ??
    item.artworkUrl100;

  if (!screenshotUrl) return [];

  return [
    {
      imageUrl: screenshotUrl,
      source: sourceUrl,
      score: item.screenshotUrls?.[0] || item.ipadScreenshotUrls?.[0] ? 96 : 72,
      confidence: item.screenshotUrls?.[0] || item.ipadScreenshotUrls?.[0] ? "high" : "medium",
      strategy: "app-store",
      reason: item.screenshotUrls?.[0] || item.ipadScreenshotUrls?.[0] ? "App Store 공식 스크린샷" : "App Store 공식 앱 이미지",
    },
  ];
}

async function collectPlayStore(project, sourceUrl) {
  const html = await fetchText(sourceUrl);
  const normalizedHtml = htmlDecode(html);
  const playUrls = Array.from(
    normalizedHtml.matchAll(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+/g),
    (match) => match[0].replace(/[),.;]+$/, ""),
  );

  const candidates = playUrls.map((imageUrl) => ({
    imageUrl,
    source: sourceUrl,
    score: scorePlayStoreImage(imageUrl),
    confidence: scorePlayStoreImage(imageUrl) >= 80 ? "high" : "medium",
    strategy: "play-store",
    reason: scorePlayStoreImage(imageUrl) >= 80 ? "Play Store 공식 스크린샷" : "Play Store 공식 앱 이미지",
  }));

  return dedupeCandidates([...candidates, ...parseMetaImages(html, sourceUrl).map((candidate) => ({
    ...candidate,
    source: sourceUrl,
    confidence: candidate.score >= 80 ? "high" : "medium",
  }))]);
}

function scorePlayStoreImage(url) {
  const lower = url.toLowerCase();
  let score = 64;

  if (/[=?&](?:w|h)\d{3,5}/.test(lower) || /=w\d{3,5}-h\d{3,5}/.test(lower)) score += 28;
  if (/=s(?:48|64|128|180|240)/.test(lower)) score -= 26;
  if (lower.includes("rw")) score += 4;

  return score;
}

function youtubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v");
    return null;
  } catch {
    return null;
  }
}

function githubRepo(sourceUrl) {
  try {
    const parsed = new URL(sourceUrl);
    if (!parsed.hostname.toLowerCase().includes("github.com")) return null;
    const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
    if (!owner || !repo) return null;
    return {
      owner,
      repo: repo.replace(/\.git$/i, ""),
    };
  } catch {
    return null;
  }
}

async function collectGithub(project, sourceUrl) {
  const repo = githubRepo(sourceUrl);
  const candidates = [];

  if (repo) {
    for (const readmeName of ["README.md", "readme.md", "README.MD"]) {
      try {
        const readmeUrl = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/HEAD/${readmeName}`;
        const response = await fetchWithTimeout(readmeUrl, {
          headers: { accept: "text/plain,*/*;q=0.8" },
        });
        if (!response.ok) continue;

        const markdown = await response.text();
        candidates.push(...parseMarkdownImages(markdown, repo, sourceUrl));
        break;
      } catch {
        continue;
      }
    }
  }

  try {
    const html = await fetchText(sourceUrl);
    candidates.push(
      ...parseMetaImages(html, sourceUrl).map((candidate) => ({
        ...candidate,
        source: sourceUrl,
        confidence: "medium",
        strategy: "github-og-image",
        reason: "GitHub 저장소 소셜 이미지",
      })),
    );
  } catch {
    // README images are usually better than the repository page fallback.
  }

  return dedupeCandidates(candidates);
}

function parseMarkdownImages(markdown, repo, sourceUrl) {
  const candidates = [];
  const markdownImagePattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlImagePattern = /<img\b[^>]*>/gi;
  let match;

  while ((match = markdownImagePattern.exec(markdown)) !== null) {
    const alt = match[1] ?? "";
    const imageUrl = resolveGithubImage(match[2], repo);
    if (!imageUrl || isBadgeImage(alt, imageUrl)) continue;
    candidates.push({
      imageUrl,
      source: sourceUrl,
      score: scoreImageUrl(imageUrl, 91),
      confidence: "high",
      strategy: "github-readme-image",
      reason: "GitHub README 공식 이미지",
    });
  }

  while ((match = htmlImagePattern.exec(markdown)) !== null) {
    const attrs = parseAttrs(match[0]);
    const imageUrl = resolveGithubImage(attrs.get("src"), repo);
    if (!imageUrl || isBadgeImage(attrs.get("alt") ?? "", imageUrl)) continue;
    candidates.push({
      imageUrl,
      source: sourceUrl,
      score: scoreImageUrl(imageUrl, 88),
      confidence: "high",
      strategy: "github-readme-html-image",
      reason: "GitHub README 공식 이미지",
    });
  }

  return candidates;
}

function resolveGithubImage(value, repo) {
  if (!value) return null;
  const cleanValue = htmlDecode(value).replace(/^<|>$/g, "");

  if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
    return cleanValue
      .replace("https://github.com/", "https://raw.githubusercontent.com/")
      .replace(/\/blob\/[^/]+\//, "/HEAD/");
  }

  if (cleanValue.startsWith("/")) {
    return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/HEAD${cleanValue}`;
  }

  return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/HEAD/${cleanValue.replace(/^\.\//, "")}`;
}

function isBadgeImage(alt, imageUrl) {
  const combined = `${alt} ${imageUrl}`.toLowerCase();
  return [
    "badge",
    "shields.io",
    "codecov",
    "travis",
    "circleci",
    "github.com/actions",
    "hits.seeyoufarm.com",
    "npm/v",
  ].some((pattern) => combined.includes(pattern));
}

async function collectPage(project, sourceUrl) {
  const videoId = youtubeId(sourceUrl);
  if (videoId) {
    return [
      {
        imageUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        source: sourceUrl,
        score: 86,
        confidence: "high",
        strategy: "youtube-thumbnail",
        reason: "YouTube 공식 영상 썸네일",
      },
    ];
  }

  const html = await fetchText(sourceUrl);
  return dedupeCandidates([
    ...parseMetaImages(html, sourceUrl).map((candidate) => ({
      ...candidate,
      source: sourceUrl,
      confidence: candidate.score >= 78 ? "high" : "medium",
    })),
    ...parseImageTags(html, sourceUrl).map((candidate) => ({
      ...candidate,
      source: sourceUrl,
      confidence: candidate.score >= 78 ? "high" : "medium",
    })),
  ]);
}

async function collectForProject(project) {
  const links = getProjectLinks(project);
  const candidates = [];
  const failures = [];

  for (const sourceUrl of links) {
    try {
      if (sourceUrl.includes("apps.apple.com")) {
        candidates.push(...(await collectAppStore(project, sourceUrl)));
      } else if (sourceUrl.includes("play.google.com")) {
        candidates.push(...(await collectPlayStore(project, sourceUrl)));
      } else if (sourceUrl.includes("github.com")) {
        candidates.push(...(await collectGithub(project, sourceUrl)));
      } else {
        candidates.push(...(await collectPage(project, sourceUrl)));
      }
    } catch (error) {
      failures.push({
        source: sourceUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const sortedCandidates = dedupeCandidates(candidates)
    .filter((candidate) => candidate.score >= 48)
    .slice(0, 5);

  for (const candidate of sortedCandidates) {
    const validation = await validateImageUrl(candidate.imageUrl);
    if (!validation.ok) continue;

    return {
      id: project.id,
      title: project.title,
      generation: project.generation,
      type: project.type,
      imageUrl: candidate.imageUrl,
      source: candidate.source,
      confidence: candidate.confidence ?? (candidate.score >= 78 ? "high" : "medium"),
      strategy: candidate.strategy,
      reason: candidate.reason,
      score: candidate.score,
      contentType: validation.contentType,
    };
  }

  return {
    id: project.id,
    title: project.title,
    generation: project.generation,
    type: project.type,
    failures,
  };
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (index < items.length) {
        const currentIndex = index;
        index += 1;
        results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      }
    }),
  );

  return results;
}

const projects = JSON.parse(await readFile(projectsPath, "utf8"));
const missingImageProjects = projects.filter((project) => !project.imageUrl);
const linkedProjects = missingImageProjects.filter(
  (project) => getProjectLinks(project).length > 0,
);
const results = await mapLimit(linkedProjects, concurrency, collectForProject);
const candidates = results.filter((result) => result.imageUrl);
const unresolved = results.filter((result) => !result.imageUrl);

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    projects: projects.length,
    missingImages: missingImageProjects.length,
    linkedMissingImages: linkedProjects.length,
    candidates: candidates.length,
    unresolved: unresolved.length,
  },
  candidates,
  unresolved,
};

const serialized = `${JSON.stringify(report, null, 2)}\n`;
if (outputPath) {
  await writeFile(outputPath, serialized);
} else {
  process.stdout.write(serialized);
}
