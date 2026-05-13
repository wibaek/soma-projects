# 소프트웨어 마에스트로 프로젝트

소프트웨어 마에스트로 프로그램의 프로젝트를 기수와 분야별로 탐색할 수 있는 정적 웹사이트입니다.

## 기술 스택

- Next.js 15 App Router
- React 18
- TypeScript
- Tailwind CSS
- Cloudflare Pages 정적 배포

## 데이터

프로젝트 데이터는 `content/projects.json`에서 관리합니다.

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
- `type`: 프로젝트 유형
- `rank`: 우수 프로젝트 여부
- `createdAt`: 생성 시각

## 개발

```bash
pnpm install
pnpm dev
```

## 정적 빌드

```bash
pnpm build
```

`next.config.mjs`의 `output: "export"` 설정으로 빌드 결과는 `out/`에 생성됩니다.

Cloudflare Pages 설정:

- Build command: `pnpm build`
- Build output directory: `out`
- Environment variables: 없음

## 검증

```bash
pnpm typecheck
pnpm build
```

빌드 후 `out/index.html`, `out/projects/<project-id>/index.html`, `out/sitemap.xml`, `out/robots.txt`가 생성되어야 합니다.
