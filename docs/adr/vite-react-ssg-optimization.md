# Vite React SSG 전환 및 최적화 기록

작성일: 2026-05-23

## 배경

이 프로젝트는 Cloudflare Pages에 정적 파일로 배포되는 프로젝트 아카이브다. 기존 구조는 Next.js `output: "export"`를 사용해 정적 HTML을 생성했지만, 서버 기능을 사용하지 않는 현재 요구사항에서는 Next 런타임과 빌드 산출물이 필요 이상으로 무거웠다.

전환 목표는 UI를 거의 바꾸지 않으면서, 기존 SEO 품질을 유지하고 정적 산출물을 더 작고 단순하게 만드는 것이었다.

## 변경 방향

Next.js App Router 기반 export를 Vite + React + 자체 SSG 파이프라인으로 대체했다.

- Vite는 클라이언트 번들러로 사용
- React는 기존 UI 컴포넌트를 최대한 재사용
- `react-dom/server`로 홈과 프로젝트 상세 페이지를 빌드 시점에 HTML로 사전 생성
- 생성된 HTML에 본문, 제목, description, canonical, Open Graph, Twitter meta를 직접 주입
- `sitemap.xml`, `robots.txt`, `404.html`을 빌드 스크립트에서 생성
- Cloudflare Pages output directory는 기존과 동일하게 `out/` 유지

## 최적화한 부분

### 1. Next 런타임 제거

기존에는 정적 export만 쓰더라도 Next의 라우팅/런타임/청크 구조가 산출물에 남았다. 전환 후에는 Vite가 만드는 최소 클라이언트 번들과 직접 생성한 HTML만 배포한다.

제거된 주요 의존성:

- `next`
- `@next/third-parties`
- `next/link`
- `next/image`
- `next/font`
- `next.config.mjs`
- `app/` 라우팅 구조

### 2. 자체 SSG 생성기 추가

`scripts/generate-static.mjs`가 Vite client manifest와 SSR 번들을 읽어서 모든 정적 route를 생성한다.

생성되는 주요 파일:

- `out/index.html`
- `out/projects/<project-id>/index.html`
- `out/sitemap.xml`
- `out/robots.txt`
- `out/404.html`

프로젝트 상세 route는 `data/projects.json` 기준으로 전부 생성한다. 현재 기준 상세 페이지는 333개다.

### 3. SEO 보존

SEO 손실을 막기 위해 SPA fallback 방식이 아니라, 각 route마다 실제 HTML을 생성한다.

홈 HTML에 포함되는 항목:

- `<title>`
- `<meta name="description">`
- `<link rel="canonical">`
- Open Graph meta
- Twitter card meta
- 실제 `<h1>`과 본문 HTML

상세 HTML에 포함되는 항목:

- 프로젝트별 `<title>`
- 프로젝트별 description
- 프로젝트별 canonical URL
- 프로젝트 제목 `<h1>`
- 프로젝트 설명 본문

### 4. robots.txt 단순화

robots는 SEO를 막지 않도록 최소 정책만 둔다.

```txt
User-agent: *
Allow: /

Sitemap: https://swmaestroproject.org/sitemap.xml
```

`Disallow`가 없기 때문에 크롤링을 차단하지 않는다.

### 5. 산출물 검증 자동화

`scripts/verify-static-output.mjs`를 추가해 빌드 후 다음을 검증한다.

- 홈 HTML 생성 여부
- 333개 프로젝트 상세 HTML 생성 여부
- `404.html` 생성 여부
- `sitemap.xml` 생성 여부
- `robots.txt` 생성 여부
- 홈/상세 페이지의 title, description, canonical, h1 존재 여부
- sitemap URL 개수와 대표 상세 URL 포함 여부
- robots의 sitemap 참조 여부

`pnpm build`는 마지막에 이 검증 스크립트를 실행한다.

## 산출물 크기 비교

비교 기준:

- Before: `main` 브랜치의 Next.js export 결과
- After: 현재 Vite React SSG 결과
- 같은 `data/projects.json` 기준

| 항목 | Next export | Vite SSG | 변화 |
| --- | ---: | ---: | ---: |
| 전체 `out/` 크기 | 14,071.6 KiB | 3,931.6 KiB | 약 72% 감소 |
| 파일 수 | 700 | 340 | 360개 감소 |
| HTML raw | 8,489.1 KiB | 3,588.2 KiB | 약 58% 감소 |
| HTML gzip | 1,817.6 KiB | 1,010.2 KiB | 약 44% 감소 |
| JS raw | 861.5 KiB | 272.7 KiB | 약 68% 감소 |
| JS gzip | 266.3 KiB | 84.6 KiB | 약 68% 감소 |
| CSS raw | 21.1 KiB | 18.4 KiB | 약 13% 감소 |
| 폰트 파일 | 213.8 KiB | 0 KiB | Next font 산출물 제거 |
| 홈 HTML | 728.4 KiB | 683.4 KiB | 감소 |
| 샘플 상세 HTML | 22.6 KiB | 8.3 KiB | 약 63% 감소 |

가장 큰 이득은 Next 런타임 청크, `_next` 파일 구조, Next font 산출물 제거에서 나왔다.

## 얻은 효과

- 정적 배포 목적에 맞게 프레임워크 오버헤드 감소
- 배포 파일 수와 전체 업로드 크기 감소
- 클라이언트 JS gzip 크기 약 68% 감소
- 상세 페이지 HTML 크기 감소
- Cloudflare Pages 배포 구조는 유지
- URL 구조 유지: `/projects/<project-id>/`
- SEO용 HTML과 meta는 유지
- sitemap과 robots 생성이 명시적인 코드로 관리됨

## 검증 결과

로컬 검증:

```bash
pnpm typecheck
pnpm build
```

빌드 검증 출력:

```txt
Static output verified: 333 project pages, sitemap, robots, SEO tags.
```

Cloudflare Pages preview 검증:

- Preview URL: `https://migrate-vite-react-ssg.soma-projects.pages.dev`
- 홈 title/description/canonical/h1 확인
- `/projects/16-aisc/` title/description/canonical/본문 확인
- `sitemap.xml` URL 334개 확인
- `robots.txt`에 `Allow: /`와 sitemap만 있는 것 확인
- 존재하지 않는 URL이 Cloudflare에서 HTTP 404로 응답하는 것 확인

## 주의할 점

Vite preview 서버는 일부 존재하지 않는 deep URL을 로컬에서 홈 HTML로 fallback할 수 있다. Cloudflare Pages preview에서는 존재하지 않는 URL이 HTTP 404로 응답하는 것을 확인했다.

향후 route 생성 방식이나 Cloudflare Pages 설정을 바꿀 때는 `404.html` 동작을 다시 확인해야 한다.

## 관련 파일

- `src/entry-server.tsx`: SSG route와 SSR 렌더링 정의
- `src/entry-client.tsx`: 클라이언트 hydration 진입점
- `scripts/generate-static.mjs`: 정적 HTML, sitemap, robots, 404 생성
- `scripts/verify-static-output.mjs`: SEO/정적 산출물 검증
- `vite.config.ts`: Vite 설정
- `package.json`: Vite build/typecheck/verify scripts
