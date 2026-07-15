export const SUBMISSION_GENERATION = 17;
export const PROJECT_SUBMISSION_TYPES = ["App", "Web", "기타"] as const;
export const TURNSTILE_ACTION = "project_submission";

export const PROJECT_SUBMISSION_LIMITS = {
  title: { min: 2, max: 100 },
  summary: { min: 10, max: 160 },
  description: { min: 20, max: 5000 },
  links: { min: 1, max: 5 },
  url: { max: 2048 },
  contactEmail: { max: 254 },
  turnstileToken: { max: 2048 },
} as const;

export type ProjectSubmissionType =
  (typeof PROJECT_SUBMISSION_TYPES)[number];

export type ProjectSubmissionRequest = {
  title: string;
  summary: string;
  description: string;
  type: ProjectSubmissionType;
  links: string[];
  imageUrl?: string;
  contactEmail: string;
  consent: true;
  turnstileToken: string;
};

export type ProjectSubmissionCreated = {
  id: string;
  generation: typeof SUBMISSION_GENERATION;
  status: "pending";
  submittedAt: string;
};

export type ProblemViolation = {
  field: string;
  reason: string;
};

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  requestId: string;
  violations?: ProblemViolation[];
};
