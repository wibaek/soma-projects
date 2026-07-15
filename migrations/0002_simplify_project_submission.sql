CREATE TABLE project_submission_next (
  id TEXT PRIMARY KEY,
  generation INTEGER NOT NULL CHECK (generation = 17),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 100),
  summary TEXT NOT NULL CHECK (length(trim(summary)) BETWEEN 1 AND 160),
  description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 1 AND 5000),
  project_type TEXT NOT NULL CHECK (project_type IN ('App', 'Web', '기타')),
  links_json TEXT NOT NULL CHECK (json_valid(links_json)),
  image_url TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_note TEXT,
  consent_version TEXT,
  consented_at TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO project_submission_next (
  id,
  generation,
  title,
  summary,
  description,
  project_type,
  links_json,
  image_url,
  status,
  reviewer_note,
  reviewed_at,
  created_at,
  updated_at
)
SELECT
  id,
  generation,
  title,
  summary,
  description,
  project_type,
  links_json,
  image_url,
  status,
  reviewer_note,
  reviewed_at,
  created_at,
  updated_at
FROM project_submission;

DROP TABLE project_submission;
ALTER TABLE project_submission_next RENAME TO project_submission;

CREATE INDEX project_submission_status_created_at_idx
  ON project_submission (status, created_at DESC);
