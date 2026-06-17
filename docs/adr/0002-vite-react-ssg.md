# ADR 0002: Vite React SSG로 정적 사이트 생성

날짜: 2026-05-23
상태: 승인됨

## 문제 상황

이 프로젝트는 Cloudflare Pages에 정적 파일로 배포되는 프로젝트 아카이브다. 기존 구조는 Next.js `output: "export"`로 정적 HTML을 생성했지만, 서버 기능을 사용하지 않는 현재 요구사항에서는 Next 런타임과 `_next` 산출물이 필요 이상으로 무거웠다.

전환 목표는 UI를 크게 바꾸지 않으면서 URL 구조와 SEO 품질을 유지하고, 정적 산출물을 더 작고 단순하게 만드는 것이었다.

## 결정

Next.js App Router 기반 export를 Vite + React + 자체 SSG 파이프라인으로 대체한다.

구체적으로 다음을 적용한다.

- Vite를 클라이언트 번들러로 사용한다.
- 기존 React UI 컴포넌트를 최대한 재사용한다.
- `react-dom/server`로 홈과 프로젝트 상세 페이지를 빌드 시점에 HTML로 사전 생성한다.
- 생성된 HTML에 본문, 제목, description, canonical, Open Graph, Twitter meta를 직접 주입한다.
- `sitemap.xml`, `robots.txt`, `404.html`을 빌드 스크립트에서 생성한다.
- Cloudflare Pages output directory는 기존과 동일하게 `out/`을 유지한다.
- `scripts/verify-static-output.mjs`로 빌드 산출물을 검증한다.

## 근거

이 사이트는 프로젝트 데이터가 빌드 시점에 확정되는 정적 아카이브다. 서버 렌더링이나 Next.js 런타임 기능을 쓰지 않으므로, Vite + 자체 SSG가 더 단순한 배포 산출물을 만든다.

SPA fallback만 쓰면 각 상세 route의 title, description, canonical, Open Graph, 본문 HTML이 약해질 수 있다. 따라서 모든 route의 실제 HTML을 생성하고 SEO meta를 직접 주입하는 방식을 선택했다.

검토했지만 선택하지 않은 대안은 다음과 같다.

- Next.js export 유지: 마이그레이션 비용은 없지만, 정적 배포 목적에 비해 런타임 청크와 산출물 구조가 무겁다.
- SPA 단일 HTML 배포: 산출물은 단순해지지만 상세 페이지 SEO 품질과 crawler 친화성이 떨어진다.
- 별도 정적 사이트 프레임워크 도입: 가능하지만 기존 React UI를 유지하면서 필요한 부분만 줄이는 목표에는 자체 SSG가 더 작고 직접적이다.

이 결정은 다음 가정을 전제로 한다.

- 프로젝트 상세 route는 `data/projects.json` 기준으로 빌드 시점에 전부 생성할 수 있다.
- 이 사이트는 서버 기능이나 동적 API route가 필요하지 않다.
- route 생성 방식이나 Cloudflare Pages 설정을 바꾸면 `404.html` 동작을 다시 검증해야 한다.

## 결과

정적 산출물은 `scripts/generate-static.mjs`가 생성하고, `pnpm build` 마지막에 `scripts/verify-static-output.mjs`가 검증한다.

검증 항목은 다음과 같다.

- 홈 HTML 생성 여부
- 333개 프로젝트 상세 HTML 생성 여부
- `404.html`, `sitemap.xml`, `robots.txt` 생성 여부
- 홈/상세 페이지의 title, description, canonical, h1 존재 여부
- sitemap URL 개수와 대표 상세 URL 포함 여부
- robots의 sitemap 참조 여부

긍정적 결과는 다음과 같다.

- 전체 `out/` 크기가 약 14,071.6 KiB에서 3,931.6 KiB로 약 72% 감소했다.
- 파일 수가 700개에서 340개로 줄었다.
- JS gzip 크기가 약 266.3 KiB에서 84.6 KiB로 약 68% 감소했다.
- URL 구조 `/projects/<project-id>/`와 SEO용 HTML/meta를 유지했다.
- sitemap, robots, 404 생성이 명시적인 코드로 관리된다.

부정적 결과는 다음과 같다.

- Next.js가 제공하던 라우팅/export 관리를 자체 SSG 스크립트가 대신하므로 유지보수 책임이 늘어난다.
- Vite preview 서버와 Cloudflare Pages의 deep URL fallback/404 동작이 다를 수 있어 배포 preview에서 다시 확인해야 한다.
- 향후 동적 서버 기능이 필요해지면 이 결정은 재검토해야 한다.

최소 검증 명령은 다음과 같다.

```bash
pnpm typecheck
pnpm build
```

기준 빌드 검증 출력은 다음과 같다.

```txt
Static output verified: 333 project pages, sitemap, robots, SEO tags.
```
