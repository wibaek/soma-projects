# 소프트웨어 마에스트로 프로젝트

소프트웨어 마에스트로 프로그램의 프로젝트를 기수와 분야별로 탐색할 수 있는 정적 웹사이트입니다.

## 기술 스택

- Vite
- React 18
- TypeScript
- Tailwind CSS
- Cloudflare Pages 정적 배포

## 데이터

프로젝트 데이터는 private repo `wibaek/soma-projects-data`를 `data/` git submodule로 연결해 관리합니다.
공개 app repo에는 submodule 포인터만 커밋하고, 실제 데이터 본문은 private data repo의
`projects.json`에만 둡니다.

처음 clone했거나 submodule이 비어 있으면 다음 명령으로 데이터를 받습니다.

```bash
git submodule update --init --recursive
```

데이터만 수정할 때는 `data/projects.json`을 수정한 뒤 `data/` submodule repo에서 먼저 커밋/푸시하고,
app repo에는 갱신된 submodule commit 포인터만 반영합니다.

필수 필드:

```json
{
  "id": "16-gyohwan-com",
  "title": "교환닷컴 - 교환학생 정보 공유·경쟁률 비교 서비스",
  "description": "프로젝트 설명",
  "generation": 16
}
```

선택 필드:

- `link`: 프로젝트 외부 링크
- `links`: 프로젝트 외부 링크가 여러 개일 때 사용하는 URL 배열
- `imageUrl`: 대표 이미지 URL
- `type`: 프로젝트 유형. `App`, `Web`, `기타` 중 하나를 사용하며 비어 있으면 `기타`로 처리
- `rank`: 우수 프로젝트 여부
- `createdAt`: 생성 시각

## 개발

```bash
pnpm install
git submodule update --init --recursive
pnpm dev
```

프로젝트 등록 화면은 `/submit/`에서 확인할 수 있습니다. 로컬 Turnstile 테스트
키를 사용하려면 `.env.example`을 `.env`로, `.dev.vars.example`을 `.dev.vars`로
복사합니다. `.dev.vars`에는 실제 운영 secret을 저장하거나 커밋하지 않습니다.

## 17기 프로젝트 등록

등록 요청은 공개 데이터나 Git 저장소에 바로 반영되지 않습니다. Pages Function의
`POST /api/v1/project-submissions`가 서버에서 입력과 Turnstile 토큰을 검증한 뒤,
D1의 `project_submission` 테이블에 `pending` 상태로 저장합니다.

Cloudflare Pages, D1, Turnstile과 GitHub `Production` environment의 설정 위치,
입력할 값, 공개 여부, 키 교체 절차는
[프로젝트 등록 운영 설정](docs/project-submission-operations.md)에 정리되어 있습니다.

```bash
pnpm d1:migrate:remote
```

현재 원격 D1 데이터베이스 ID는 `wrangler.remote.jsonc`에 저장되어 있습니다.
데이터베이스를 새로 만드는 경우에만 파일의 `database_id`를 새 ID로 변경합니다.

대기 중인 등록 요청은 관리자 화면 없이 Wrangler로 확인할 수 있습니다.

```bash
pnpm d1:queue
```

상세 내용을 확인할 때는 접수 번호를 사용합니다.

```bash
pnpm wrangler d1 execute soma-projects --remote \
  --config wrangler.remote.jsonc \
  --command "SELECT * FROM project_submission WHERE id = 'sub_...'"
```

현재 등록 폼의 필수 항목은 프로젝트 이름, 한 줄 소개, 자세한 소개, 분야,
대표 링크입니다. 기수는 서버에서 17기로 고정하며, 연락처는 수집하지 않습니다.

로컬 D1 migration 검증은 운영 데이터베이스 ID와 무관한
`wrangler.local.jsonc`를 사용합니다.

```bash
pnpm d1:migrate:local
```

## 정적 빌드

```bash
pnpm build
```

Vite 클라이언트 번들과 React 서버 렌더링 기반 SSG 스크립트로 빌드 결과는 `out/`에 생성됩니다.
빌드 시작 시 `data/projects.json` 존재 여부와 기본 스키마를 검증합니다.

Cloudflare Pages는 GitHub Actions에서 `pnpm build`로 생성한 `out/`을 Wrangler Direct Upload로
배포합니다. 전체 배포 설정은 [프로젝트 등록 운영 설정](docs/project-submission-operations.md)을 참고합니다.

## 검증

```bash
pnpm validate:data
pnpm typecheck
pnpm build
```

빌드 후 `out/index.html`, `out/submit/index.html`, `out/projects/<project-id>/index.html`,
`out/sitemap.xml`, `out/robots.txt`, `out/404.html`이 생성되어야 합니다.
