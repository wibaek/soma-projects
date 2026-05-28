# Project Data Submodule Design

작성일: 2026-05-23

## 목표

`projects.json` 본문이 공개 app repo에 올라가지 않도록 분리한다.
app repo는 정적 사이트 코드와 private data repo의 commit 포인터만 관리한다.

## 구조

- 공개 app repo: `wibaek/soma-projects`
- private data repo: `wibaek/soma-projects-data`
- app repo submodule 경로: `data/`
- 실제 데이터 파일: `data/projects.json`

공개 repo에 노출되는 것은 `.gitmodules`의 private repo URL과 submodule commit SHA뿐이다.
데이터 본문은 private repo 권한이 있는 환경에서만 checkout된다.

## 공개 히스토리 주의

`git rm content/projects.json`은 앞으로의 app repo HEAD에서 데이터 파일을 제거하는 작업이다.
이미 공개 repo의 과거 commit에 들어간 데이터까지 삭제하지는 않는다.

과거 히스토리 노출도 문제라면 별도 작업으로 `git filter-repo` 또는 BFG 기반 history rewrite를 수행하고,
GitHub remote를 force push해야 한다. 이 작업은 기존 clone과 PR에 영향을 주므로 별도 승인 후 진행한다.

## 빌드 흐름

1. `git submodule update --init --recursive`로 `data/`를 checkout한다.
2. `pnpm validate:data`가 `data/projects.json`의 존재와 기본 스키마를 검증한다.
3. Vite SSR 빌드가 `lib/data.ts`를 통해 `data/projects.json`을 읽는다.
4. `scripts/generate-static.mjs`가 전체 HTML, sitemap, robots, 404를 `out/`에 생성한다.
5. `scripts/verify-static-output.mjs`가 생성된 정적 산출물을 검증한다.

## 데이터 수정 절차

```bash
cd data
git pull --ff-only
# projects.json 수정
git add projects.json
git commit -m "data: 프로젝트 데이터 갱신"
git push

cd ..
git add data
git commit -m "chore: 데이터 submodule 포인터 갱신"
```

데이터 수정만 있을 때도 app repo에는 submodule 포인터 변경 commit이 남는다.
이 방식은 어떤 데이터 snapshot으로 사이트가 빌드됐는지 재현 가능하게 만든다.

## Cloudflare 배포

현재 Cloudflare Pages 프로젝트는 Git 연동이 아니라 Wrangler direct upload 방식으로 배포한다.
로컬 또는 CI에서 submodule을 checkout한 뒤 `pnpm build`와 `wrangler pages deploy out`을 실행하면 된다.

GitHub Actions로 옮길 경우 checkout 단계는 submodule 권한을 가진 token을 사용해야 한다.

```yaml
- uses: actions/checkout@v4
  with:
    submodules: recursive
    token: ${{ secrets.DATA_REPO_TOKEN }}
```

Cloudflare Pages Git integration을 직접 쓰는 방식은 private submodule 인증을 별도로 맞춰야 하므로,
이 프로젝트에는 direct upload 또는 GitHub Actions 기반 배포가 더 단순하다.

## 실패 모드

- `data/projects.json`이 없으면 `pnpm validate:data`와 `pnpm build`가 즉시 실패한다.
- 데이터 형식이 깨지면 `scripts/validate-project-data.mjs`가 잘못된 필드를 출력한다.
- private repo 권한이 없는 환경에서는 submodule checkout이 실패한다.
