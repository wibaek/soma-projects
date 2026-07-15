import {
  PROJECT_SUBMISSION_LIMITS,
  PROJECT_SUBMISSION_TYPES,
  SUBMISSION_GENERATION,
  TURNSTILE_ACTION,
  type ProblemDetails,
  type ProblemViolation,
  type ProjectSubmissionCreated,
  type ProjectSubmissionRequest,
  type ProjectSubmissionType,
} from "../../../lib/project-submission";

type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  run: () => Promise<unknown>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

type Env = {
  SUBMISSION_DB?: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_EXPECTED_HOSTNAME?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

type PagesFunction = (context: PagesContext) => Promise<Response>;

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

type ValidatedSubmission = Omit<
  ProjectSubmissionRequest,
  "consent" | "turnstileToken"
> & {
  imageUrl: string;
  turnstileToken: string;
};

type ValidationResult =
  | { ok: true; value: ValidatedSubmission }
  | { ok: false; violations: ProblemViolation[] };

type TurnstileResult =
  | { ok: true }
  | { ok: false; unavailable: boolean };

const MAX_REQUEST_BYTES = 32 * 1024;
const CONSENT_VERSION = "2026-07-14";
const PROBLEM_BASE_URL = "https://swmaestroproject.org/problems";
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const onRequest: PagesFunction = async ({ request, env }) => {
  const requestId = crypto.randomUUID();

  if (request.method !== "POST") {
    return problemResponse(
      request,
      requestId,
      405,
      "METHOD_NOT_ALLOWED",
      "지원하지 않는 요청 방식",
      "프로젝트 등록은 POST 요청만 지원합니다.",
      undefined,
      { Allow: "POST" }
    );
  }

  if (!isSameOriginRequest(request)) {
    return problemResponse(
      request,
      requestId,
      403,
      "ORIGIN_NOT_ALLOWED",
      "허용되지 않은 요청",
      "이 사이트에서 시작한 등록 요청만 처리할 수 있습니다."
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return problemResponse(
      request,
      requestId,
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "지원하지 않는 요청 형식",
      "Content-Type은 application/json이어야 합니다."
    );
  }

  if (!env.SUBMISSION_DB || !env.TURNSTILE_SECRET_KEY) {
    return problemResponse(
      request,
      requestId,
      503,
      "SUBMISSION_SERVICE_NOT_CONFIGURED",
      "등록 기능 준비 중",
      "등록 기능 설정이 아직 완료되지 않았습니다. 잠시 후 다시 시도해주세요."
    );
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return requestTooLargeResponse(request, requestId);
  }

  let requestBody: string;

  try {
    requestBody = await request.text();
  } catch {
    return invalidJsonResponse(request, requestId);
  }

  if (new TextEncoder().encode(requestBody).byteLength > MAX_REQUEST_BYTES) {
    return requestTooLargeResponse(request, requestId);
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(requestBody);
  } catch {
    return invalidJsonResponse(request, requestId);
  }

  const validation = validateSubmission(parsedBody);
  if (!validation.ok) {
    return problemResponse(
      request,
      requestId,
      422,
      "VALIDATION_ERROR",
      "입력 내용을 확인해주세요",
      "등록 요청에 올바르지 않은 항목이 있습니다.",
      validation.violations
    );
  }

  const turnstileResult = await verifyTurnstile(
    request,
    env,
    validation.value.turnstileToken
  );

  if (!turnstileResult.ok) {
    if (turnstileResult.unavailable) {
      return problemResponse(
        request,
        requestId,
        503,
        "TURNSTILE_UNAVAILABLE",
        "사람 확인 서비스 연결 실패",
        "사람 확인 서비스를 연결하지 못했습니다. 잠시 후 다시 시도해주세요."
      );
    }

    return problemResponse(
      request,
      requestId,
      422,
      "TURNSTILE_VERIFICATION_FAILED",
      "사람 확인 실패",
      "사람 확인이 만료되었거나 유효하지 않습니다. 다시 시도해주세요.",
      [
        {
          field: "turnstileToken",
          reason: "사람 확인을 다시 완료해주세요.",
        },
      ]
    );
  }

  const submissionId = `sub_${crypto.randomUUID().replace(/-/g, "")}`;
  const submittedAt = new Date().toISOString();
  const submission = validation.value;

  try {
    await env.SUBMISSION_DB.prepare(
      `INSERT INTO project_submission (
        id,
        generation,
        title,
        summary,
        description,
        project_type,
        links_json,
        image_url,
        contact_email,
        status,
        consent_version,
        consented_at,
        created_at,
        updated_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'pending', ?10, ?11, ?12, ?13)`
    )
      .bind(
        submissionId,
        SUBMISSION_GENERATION,
        submission.title,
        submission.summary,
        submission.description,
        submission.type,
        JSON.stringify(submission.links),
        submission.imageUrl || null,
        submission.contactEmail,
        CONSENT_VERSION,
        submittedAt,
        submittedAt,
        submittedAt
      )
      .run();
  } catch (error) {
    console.error("Failed to store project submission", {
      requestId,
      error,
    });

    return problemResponse(
      request,
      requestId,
      503,
      "SUBMISSION_STORAGE_UNAVAILABLE",
      "등록 요청 저장 실패",
      "등록 요청을 저장하지 못했습니다. 잠시 후 다시 시도해주세요."
    );
  }

  const created: ProjectSubmissionCreated = {
    id: submissionId,
    generation: SUBMISSION_GENERATION,
    status: "pending",
    submittedAt,
  };

  return Response.json(created, {
    status: 201,
    headers: responseHeaders(requestId),
  });
};

function validateSubmission(value: unknown): ValidationResult {
  if (!isRecord(value)) {
    return {
      ok: false,
      violations: [
        {
          field: "body",
          reason: "요청 본문은 JSON 객체여야 합니다.",
        },
      ],
    };
  }

  const violations: ProblemViolation[] = [];
  const title = validateText(
    value.title,
    "title",
    "프로젝트 이름",
    PROJECT_SUBMISSION_LIMITS.title,
    violations
  );
  const summary = validateText(
    value.summary,
    "summary",
    "한 줄 소개",
    PROJECT_SUBMISSION_LIMITS.summary,
    violations
  );
  const description = validateText(
    value.description,
    "description",
    "자세한 소개",
    PROJECT_SUBMISSION_LIMITS.description,
    violations
  );
  const type = validateProjectType(value.type, violations);
  const links = validateLinks(value.links, violations);
  const imageUrl = validateOptionalUrl(value.imageUrl, "imageUrl", violations);
  const contactEmail = validateEmail(value.contactEmail, violations);
  const turnstileToken = validateTurnstileToken(
    value.turnstileToken,
    violations
  );

  if (value.consent !== true) {
    violations.push({
      field: "consent",
      reason: "프로젝트 정보 공개 동의가 필요합니다.",
    });
  }

  if (violations.length > 0) {
    return { ok: false, violations };
  }

  return {
    ok: true,
    value: {
      title,
      summary,
      description,
      type,
      links,
      imageUrl,
      contactEmail,
      turnstileToken,
    },
  };
}

function validateText(
  value: unknown,
  field: string,
  label: string,
  limits: { min: number; max: number },
  violations: ProblemViolation[]
): string {
  if (typeof value !== "string") {
    violations.push({ field, reason: `${label}을 입력해주세요.` });
    return "";
  }

  const normalized = value.trim();

  if (normalized.length < limits.min) {
    violations.push({
      field,
      reason: `${label}은 ${limits.min}자 이상 입력해주세요.`,
    });
  } else if (normalized.length > limits.max) {
    violations.push({
      field,
      reason: `${label}은 ${limits.max}자 이하로 입력해주세요.`,
    });
  }

  return normalized;
}

function validateProjectType(
  value: unknown,
  violations: ProblemViolation[]
): ProjectSubmissionType {
  if (
    typeof value !== "string" ||
    !PROJECT_SUBMISSION_TYPES.includes(value as ProjectSubmissionType)
  ) {
    violations.push({
      field: "type",
      reason: "분야는 App, Web, 기타 중에서 선택해주세요.",
    });
    return "기타";
  }

  return value as ProjectSubmissionType;
}

function validateLinks(
  value: unknown,
  violations: ProblemViolation[]
): string[] {
  if (!Array.isArray(value)) {
    violations.push({
      field: "links",
      reason: "대표 링크를 입력해주세요.",
    });
    return [];
  }

  const links = value
    .filter((link): link is string => typeof link === "string")
    .map((link) => link.trim())
    .filter(Boolean);
  const uniqueLinks = Array.from(new Set(links));

  if (
    uniqueLinks.length < PROJECT_SUBMISSION_LIMITS.links.min ||
    uniqueLinks.length > PROJECT_SUBMISSION_LIMITS.links.max
  ) {
    violations.push({
      field: "links",
      reason: `링크를 ${PROJECT_SUBMISSION_LIMITS.links.min}개 이상 ${PROJECT_SUBMISSION_LIMITS.links.max}개 이하로 입력해주세요.`,
    });
  }

  if (links.length !== value.length || uniqueLinks.length !== links.length) {
    violations.push({
      field: "links",
      reason: "링크는 중복 없이 올바른 문자열로 입력해주세요.",
    });
  }

  if (uniqueLinks.some((link) => !isValidPublicUrl(link))) {
    violations.push({
      field: "links",
      reason: "링크는 http 또는 https로 시작하는 올바른 URL이어야 합니다.",
    });
  }

  return uniqueLinks;
}

function validateOptionalUrl(
  value: unknown,
  field: string,
  violations: ProblemViolation[]
): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value !== "string" || !isValidPublicUrl(value.trim())) {
    violations.push({
      field,
      reason: "http 또는 https로 시작하는 올바른 이미지 URL을 입력해주세요.",
    });
    return "";
  }

  return value.trim();
}

function validateEmail(
  value: unknown,
  violations: ProblemViolation[]
): string {
  if (typeof value !== "string") {
    violations.push({
      field: "contactEmail",
      reason: "연락받을 이메일을 입력해주세요.",
    });
    return "";
  }

  const normalized = value.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    normalized.length === 0 ||
    normalized.length > PROJECT_SUBMISSION_LIMITS.contactEmail.max ||
    !emailPattern.test(normalized)
  ) {
    violations.push({
      field: "contactEmail",
      reason: "올바른 이메일 주소를 입력해주세요.",
    });
  }

  return normalized;
}

function validateTurnstileToken(
  value: unknown,
  violations: ProblemViolation[]
): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > PROJECT_SUBMISSION_LIMITS.turnstileToken.max
  ) {
    violations.push({
      field: "turnstileToken",
      reason: "사람 확인을 완료해주세요.",
    });
    return "";
  }

  return value;
}

function isValidPublicUrl(value: string): boolean {
  if (value.length > PROJECT_SUBMISSION_LIMITS.url.max) return false;

  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

async function verifyTurnstile(
  request: Request,
  env: Env,
  token: string
): Promise<TurnstileResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

  try {
    const verificationResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP") || undefined,
        idempotency_key: crypto.randomUUID(),
      }),
      signal: controller.signal,
    });

    if (!verificationResponse.ok) {
      return { ok: false, unavailable: true };
    }

    const result = (await verificationResponse.json()) as TurnstileResponse;

    if (!result.success || result.action !== TURNSTILE_ACTION) {
      return { ok: false, unavailable: false };
    }

    if (
      env.TURNSTILE_EXPECTED_HOSTNAME &&
      result.hostname !== env.TURNSTILE_EXPECTED_HOSTNAME
    ) {
      return { ok: false, unavailable: false };
    }

    return { ok: true };
  } catch (error) {
    console.error("Turnstile verification request failed", { error });
    return { ok: false, unavailable: true };
  } finally {
    clearTimeout(timeoutId);
  }
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidJsonResponse(request: Request, requestId: string): Response {
  return problemResponse(
    request,
    requestId,
    400,
    "INVALID_JSON",
    "잘못된 JSON 요청",
    "요청 본문을 JSON 객체로 읽을 수 없습니다."
  );
}

function requestTooLargeResponse(
  request: Request,
  requestId: string
): Response {
  return problemResponse(
    request,
    requestId,
    413,
    "REQUEST_TOO_LARGE",
    "요청 크기 초과",
    "등록 요청은 32KB를 초과할 수 없습니다."
  );
}

function problemResponse(
  request: Request,
  requestId: string,
  status: number,
  code: string,
  title: string,
  detail: string,
  violations?: ProblemViolation[],
  extraHeaders?: HeadersInit
): Response {
  const problem: ProblemDetails = {
    type: `${PROBLEM_BASE_URL}/${code.toLowerCase().replace(/_/g, "-")}`,
    title,
    status,
    detail,
    instance: new URL(request.url).pathname,
    code,
    requestId,
  };

  if (violations && violations.length > 0) {
    problem.violations = violations;
  }

  const headers = new Headers(responseHeaders(requestId));
  headers.set("Content-Type", "application/problem+json; charset=utf-8");

  if (extraHeaders) {
    new Headers(extraHeaders).forEach((value, key) => headers.set(key, value));
  }

  return new Response(JSON.stringify(problem), { status, headers });
}

function responseHeaders(requestId: string): HeadersInit {
  return {
    "Cache-Control": "no-store",
    "X-Request-Id": requestId,
  };
}
