import { useCallback, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  ExternalLink,
  LockKeyhole,
  Plus,
} from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { TurnstileWidget } from "@/components/turnstile-widget";
import type { Project } from "@/lib/data";
import {
  PROJECT_SUBMISSION_LIMITS,
  PROJECT_SUBMISSION_TYPES,
  SUBMISSION_GENERATION,
  type ProblemDetails,
  type ProjectSubmissionCreated,
  type ProjectSubmissionRequest,
  type ProjectSubmissionType,
} from "@/lib/project-submission";

const TEST_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ||
  (import.meta.env.DEV ? TEST_TURNSTILE_SITE_KEY : "");

type FormValues = {
  title: string;
  summary: string;
  description: string;
  type: ProjectSubmissionType;
  primaryLink: string;
  additionalLink: string;
  imageUrl: string;
  contactEmail: string;
  consent: boolean;
};

const INITIAL_VALUES: FormValues = {
  title: "",
  summary: "",
  description: "",
  type: "Web",
  primaryLink: "",
  additionalLink: "",
  imageUrl: "",
  contactEmail: "",
  consent: false,
};

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "success"; submission: ProjectSubmissionCreated };

export function ProjectSubmissionForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: "idle",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [showAdditionalLink, setShowAdditionalLink] = useState(false);

  const handleTurnstileTokenChange = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) {
      setFieldErrors((current) => {
        if (!current.turnstileToken) return current;
        const next = { ...current };
        delete next.turnstileToken;
        return next;
      });
    }
  }, []);

  if (submissionState.status === "success") {
    return <SubmissionComplete submission={submissionState.submission} />;
  }

  const previewProject: Project = {
    id: "preview",
    title: values.title.trim() || "프로젝트 이름",
    description:
      values.summary.trim() ||
      "프로젝트를 한 문장으로 소개하면 카드에 이렇게 표시됩니다.",
    type: values.type,
    generation: SUBMISSION_GENERATION,
    imageUrl: values.imageUrl.trim(),
    link: values.primaryLink.trim(),
    links: [],
    rank: false,
  };

  function updateValue<Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!TURNSTILE_SITE_KEY) {
      setSubmissionState({
        status: "error",
        message: "등록 기능 설정이 아직 완료되지 않았습니다.",
      });
      return;
    }

    if (!turnstileToken) {
      setFieldErrors((current) => ({
        ...current,
        turnstileToken: "사람 확인이 끝날 때까지 잠시 기다려주세요.",
      }));
      return;
    }

    if (!values.consent) {
      setFieldErrors((current) => ({
        ...current,
        consent: "프로젝트 정보 공개 동의가 필요합니다.",
      }));
      return;
    }

    const payload: ProjectSubmissionRequest = {
      title: values.title.trim(),
      summary: values.summary.trim(),
      description: values.description.trim(),
      type: values.type,
      links: [values.primaryLink, values.additionalLink]
        .map((link) => link.trim())
        .filter(Boolean),
      contactEmail: values.contactEmail.trim(),
      consent: true,
      turnstileToken,
    };

    if (values.imageUrl.trim()) {
      payload.imageUrl = values.imageUrl.trim();
    }

    setSubmissionState({ status: "submitting" });
    setFieldErrors({});

    try {
      const response = await fetch("/api/v1/project-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const problem = await readProblemDetails(response);
        const violations = Object.fromEntries(
          (problem.violations ?? []).map((violation) => [
            violation.field,
            violation.reason,
          ])
        );
        setFieldErrors(violations);
        setSubmissionState({
          status: "error",
          message:
            problem.detail ||
            "등록 요청을 보내지 못했습니다. 잠시 후 다시 시도해주세요.",
        });
        setTurnstileResetSignal((current) => current + 1);
        return;
      }

      const submission = (await response.json()) as ProjectSubmissionCreated;
      setSubmissionState({ status: "success", submission });
    } catch {
      setSubmissionState({
        status: "error",
        message: "네트워크 연결을 확인한 뒤 다시 시도해주세요.",
      });
      setTurnstileResetSignal((current) => current + 1);
    }
  }

  const isSubmitting = submissionState.status === "submitting";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
      <form onSubmit={handleSubmit} className="min-w-0 space-y-10">
        <FormSection
          number="01"
          title="기본 정보"
          description="프로젝트를 처음 보는 사람도 이해할 수 있게 소개해주세요."
        >
          <Field
            label="프로젝트 이름"
            name="title"
            required
            error={fieldErrors.title}
          >
            <input
              id="title"
              name="title"
              type="text"
              required
              minLength={PROJECT_SUBMISSION_LIMITS.title.min}
              maxLength={PROJECT_SUBMISSION_LIMITS.title.max}
              autoComplete="off"
              value={values.title}
              onChange={(event) => updateValue("title", event.target.value)}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? "title-error" : undefined}
              placeholder="예: AISC - AI 활용능력평가"
              className={inputClassName(fieldErrors.title)}
            />
          </Field>

          <Field
            label="한 줄 소개"
            name="summary"
            required
            hint={`${values.summary.length}/${PROJECT_SUBMISSION_LIMITS.summary.max}`}
            error={fieldErrors.summary}
          >
            <input
              id="summary"
              name="summary"
              type="text"
              required
              minLength={PROJECT_SUBMISSION_LIMITS.summary.min}
              maxLength={PROJECT_SUBMISSION_LIMITS.summary.max}
              value={values.summary}
              onChange={(event) => updateValue("summary", event.target.value)}
              aria-invalid={Boolean(fieldErrors.summary)}
              aria-describedby={
                fieldErrors.summary ? "summary-error" : "summary-hint"
              }
              placeholder="누구를 위해 어떤 문제를 해결하는 프로젝트인지 알려주세요"
              className={inputClassName(fieldErrors.summary)}
            />
          </Field>

          <Field label="분야" name="type" required error={fieldErrors.type}>
            <div className="grid grid-cols-3 gap-2">
              {PROJECT_SUBMISSION_TYPES.map((type) => (
                <label
                  key={type}
                  className={`flex h-11 cursor-pointer items-center justify-center rounded-lg border text-[14px] font-medium transition-colors focus-within:ring-2 focus-within:ring-brand/20 ${
                    values.type === type
                      ? "border-ink bg-ink text-paper"
                      : "border-border bg-background text-foreground hover:bg-subtle"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={values.type === type}
                    onChange={() => updateValue("type", type)}
                    className="sr-only"
                  />
                  {type}
                </label>
              ))}
            </div>
          </Field>

          <Field
            label="자세한 소개"
            name="description"
            required
            hint={`${values.description.length}/${PROJECT_SUBMISSION_LIMITS.description.max}`}
            error={fieldErrors.description}
            description="README나 기존 소개 글을 그대로 붙여 넣어도 괜찮아요. Markdown을 지원합니다."
          >
            <textarea
              id="description"
              name="description"
              required
              minLength={PROJECT_SUBMISSION_LIMITS.description.min}
              maxLength={PROJECT_SUBMISSION_LIMITS.description.max}
              rows={9}
              value={values.description}
              onChange={(event) =>
                updateValue("description", event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={
                fieldErrors.description
                  ? "description-error"
                  : "description-description description-hint"
              }
              placeholder="프로젝트를 시작한 이유, 주요 기능, 기술적 특징 등을 자유롭게 적어주세요."
              className={`${inputClassName(fieldErrors.description)} min-h-48 resize-y py-3 leading-relaxed`}
            />
          </Field>
        </FormSection>

        <FormSection
          number="02"
          title="링크와 이미지"
          description="다른 사람이 프로젝트를 직접 확인할 수 있는 곳을 알려주세요."
        >
          <Field
            label="대표 링크"
            name="primaryLink"
            required
            error={fieldErrors.links}
            description="배포 사이트, 앱스토어, GitHub 중 가장 잘 보여주는 링크를 넣어주세요."
          >
            <div className="relative">
              <ExternalLink className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="primaryLink"
                name="primaryLink"
                type="url"
                required
                maxLength={PROJECT_SUBMISSION_LIMITS.url.max}
                value={values.primaryLink}
                onChange={(event) =>
                  updateValue("primaryLink", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.links)}
                aria-describedby={
                  fieldErrors.links
                    ? "primaryLink-error"
                    : "primaryLink-description"
                }
                placeholder="https://"
                className={`${inputClassName(fieldErrors.links)} pl-10`}
              />
            </div>
          </Field>

          {showAdditionalLink ? (
            <Field label="추가 링크" name="additionalLink">
              <div className="relative">
                <ExternalLink className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="additionalLink"
                  name="additionalLink"
                  type="url"
                  maxLength={PROJECT_SUBMISSION_LIMITS.url.max}
                  value={values.additionalLink}
                  onChange={(event) =>
                    updateValue("additionalLink", event.target.value)
                  }
                  placeholder="https://"
                  className={`${inputClassName()} pl-10`}
                />
              </div>
            </Field>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdditionalLink(true)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink-deep"
            >
              <Plus className="h-3.5 w-3.5" />
              링크 하나 더 추가
            </button>
          )}

          <Field
            label="대표 이미지 URL"
            name="imageUrl"
            error={fieldErrors.imageUrl}
            description="비워두면 검수 과정에서 프로젝트 링크를 참고해 대표 이미지를 찾아볼게요."
          >
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              maxLength={PROJECT_SUBMISSION_LIMITS.url.max}
              value={values.imageUrl}
              onChange={(event) => updateValue("imageUrl", event.target.value)}
              aria-invalid={Boolean(fieldErrors.imageUrl)}
              aria-describedby={
                fieldErrors.imageUrl
                  ? "imageUrl-error"
                  : "imageUrl-description"
              }
              placeholder="https://example.com/cover.png"
              className={inputClassName(fieldErrors.imageUrl)}
            />
          </Field>
        </FormSection>

        <FormSection
          number="03"
          title="제출 확인"
          description="검수 중 확인이 필요할 때만 연락드려요. 연락처는 공개되지 않습니다."
        >
          <Field
            label="연락받을 이메일"
            name="contactEmail"
            required
            error={fieldErrors.contactEmail}
          >
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                maxLength={PROJECT_SUBMISSION_LIMITS.contactEmail.max}
                autoComplete="email"
                value={values.contactEmail}
                onChange={(event) =>
                  updateValue("contactEmail", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.contactEmail)}
                aria-describedby={
                  fieldErrors.contactEmail ? "contactEmail-error" : undefined
                }
                placeholder="name@example.com"
                className={`${inputClassName(fieldErrors.contactEmail)} pl-10`}
              />
            </div>
          </Field>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-[13.5px] leading-relaxed transition-colors ${
              fieldErrors.consent
                ? "border-destructive/50 bg-destructive/5"
                : values.consent
                  ? "border-brand/35 bg-brand-soft/50"
                  : "border-border bg-background hover:bg-subtle"
            }`}
          >
            <input
              type="checkbox"
              name="consent"
              required
              checked={values.consent}
              onChange={(event) =>
                updateValue("consent", event.target.checked)
              }
              className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand/30"
            />
            <span>
              본인이 이 프로젝트의 구성원이거나 등록 권한이 있으며, 입력한 정보와
              이미지가 SOMA Projects에 공개되는 것에 동의합니다.
            </span>
          </label>
          {fieldErrors.consent && (
            <p id="consent-error" className="text-[12px] text-destructive">
              {fieldErrors.consent}
            </p>
          )}

          {TURNSTILE_SITE_KEY ? (
            <div>
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                resetSignal={turnstileResetSignal}
                onTokenChange={handleTurnstileTokenChange}
              />
              {fieldErrors.turnstileToken && (
                <p className="mt-2 text-[12px] text-destructive">
                  {fieldErrors.turnstileToken}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-[13px] leading-relaxed text-ink-deep">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              등록 기능을 활성화하려면 Turnstile 사이트 키 설정이 필요합니다.
            </div>
          )}

          {submissionState.status === "error" && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] leading-relaxed text-destructive"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {submissionState.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !TURNSTILE_SITE_KEY}
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 text-[14px] font-semibold text-paper transition-colors hover:bg-ink-deep disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSubmitting ? "등록 요청을 보내는 중…" : "검토 요청하기"}
            {!isSubmitting && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>

          <p className="text-center text-[12px] leading-relaxed text-muted-foreground">
            제출 즉시 공개되지 않으며, 검토가 끝난 프로젝트만 아카이브에
            반영됩니다.
          </p>
        </FormSection>
      </form>

      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              카드 미리보기
            </p>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
              {SUBMISSION_GENERATION}기
            </span>
          </div>
          <ProjectCard project={previewProject} preview />
          <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
            최종 공개 전 검수 과정에서 문장과 대표 이미지가 조금 다듬어질 수
            있어요.
          </p>
        </div>
      </aside>
    </div>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-7">
      <div className="mb-7 flex gap-4">
        <span className="nums pt-0.5 font-mono text-[11px] text-muted-foreground">
          {number}
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink-deep">
            {title}
          </h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-6 pl-0 sm:pl-8">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  required,
  hint,
  error,
  description,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={name} className="text-[13.5px] font-medium text-ink-deep">
          {label}
          {required && <span className="ml-1 text-brand">*</span>}
        </label>
        {hint && (
          <span
            id={`${name}-hint`}
            className="nums text-[11px] text-muted-foreground"
          >
            {hint}
          </span>
        )}
      </div>
      {description && (
        <p
          id={`${name}-description`}
          className="mb-2 text-[12px] leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
      )}
      {children}
      {error && (
        <p
          id={`${name}-error`}
          className="mt-2 text-[12px] text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SubmissionComplete({
  submission,
}: {
  submission: ProjectSubmissionCreated;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-6 py-14 text-center sm:px-10 sm:py-20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Check className="h-6 w-6" />
      </div>
      <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        제출 완료
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-deep sm:text-3xl">
        프로젝트를 잘 받았어요
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
        내용을 확인한 뒤 아카이브 반영 여부를 검토할게요. 추가 확인이 필요한
        경우 입력한 이메일로 연락드립니다.
      </p>
      <div className="mx-auto mt-7 max-w-sm rounded-lg border border-border bg-subtle px-4 py-3">
        <span className="text-[11px] text-muted-foreground">접수 번호</span>
        <p className="nums mt-1 break-all font-mono text-[12px] font-medium text-ink-deep">
          {submission.id}
        </p>
      </div>
      <a
        href="/"
        className="mt-8 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-subtle"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        프로젝트 둘러보기
      </a>
    </div>
  );
}

function inputClassName(error?: string): string {
  return `h-11 w-full rounded-lg border bg-background px-3.5 text-[14px] text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:ring-2 ${
    error
      ? "border-destructive/60 focus:border-destructive focus:ring-destructive/10"
      : "border-border focus:border-brand focus:ring-brand/15"
  }`;
}

async function readProblemDetails(response: Response): Promise<ProblemDetails> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/problem+json")) {
    return (await response.json()) as ProblemDetails;
  }

  return {
    type: "about:blank",
    title: "요청 실패",
    status: response.status,
    detail: "등록 요청을 처리하지 못했습니다.",
    instance: "/api/v1/project-submissions",
    code: "UNKNOWN_ERROR",
    requestId: "",
  };
}
