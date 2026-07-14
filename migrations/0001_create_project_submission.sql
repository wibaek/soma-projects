CREATE TABLE project_submission (
  id TEXT PRIMARY KEY,
  generation INTEGER NOT NULL CHECK (generation = 17),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 2 AND 100),
  summary TEXT NOT NULL CHECK (length(summary) BETWEEN 10 AND 160),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 20 AND 5000),
  project_type TEXT NOT NULL CHECK (project_type IN ('App', 'Web', '기타')),
  links_json TEXT NOT NULL CHECK (json_valid(links_json)),
  image_url TEXT,
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_note TEXT,
  consent_version TEXT NOT NULL,
  consented_at TEXT NOT NULL,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX project_submission_status_created_at_idx
  ON project_submission (status, created_at DESC);
