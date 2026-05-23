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
  "id": "16-aisc",
  "title": "AISC - AI 활용능력평가",
  "description": "프로젝트 설명",
  "generation": 16
}
```

선택 필드:

- `link`: 프로젝트 외부 링크
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

## 정적 빌드

```bash
pnpm build
```

Vite 클라이언트 번들과 React 서버 렌더링 기반 SSG 스크립트로 빌드 결과는 `out/`에 생성됩니다.
빌드 시작 시 `data/projects.json` 존재 여부와 기본 스키마를 검증합니다.

Cloudflare Pages 설정:

- Build command: `pnpm build`
- Build output directory: `out`
- Environment variables: 없음

## 검증

```bash
pnpm validate:data
pnpm typecheck
pnpm build
```

빌드 후 `out/index.html`, `out/projects/<project-id>/index.html`, `out/sitemap.xml`, `out/robots.txt`, `out/404.html`이 생성되어야 합니다.
