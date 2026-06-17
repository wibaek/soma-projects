# ADR 0001: 프로젝트 데이터를 private submodule로 분리

날짜: 2026-05-23
상태: 승인됨

## 문제 상황

이 사이트는 정적 프로젝트 아카이브지만, `projects.json` 본문을 공개 app repo에 계속 두면 데이터 전체가 public Git history에 남는다. 사이트 빌드에는 프로젝트 데이터가 필요하지만, app repo에는 정적 사이트 코드와 어떤 데이터 snapshot으로 빌드했는지만 남기는 편이 더 적합하다.

또한 데이터 변경과 UI/배포 코드 변경은 성격이 다르다. 데이터만 갱신할 때도 어떤 데이터 commit으로 사이트가 생성됐는지 재현할 수 있어야 한다.

## 결정

프로젝트 데이터는 private repo인 `wibaek/soma-projects-data`로 분리하고, 공개 app repo `wibaek/soma-projects`는 `data/` 경로에 private data repo를 submodule로 연결한다.

실제 데이터 파일은 `data/projects.json`으로 둔다. app repo에는 `.gitmodules`의 private repo URL과 submodule commit SHA만 남기고, 데이터 본문은 private repo 권한이 있는 환경에서만 checkout한다.

빌드 흐름은 다음과 같다.

1. `git submodule update --init --recursive`로 `data/`를 checkout한다.
2. `pnpm validate:data`가 `data/projects.json`의 존재와 기본 스키마를 검증한다.
3. Vite SSR 빌드가 `lib/data.ts`를 통해 `data/projects.json`을 읽는다.
4. `scripts/generate-static.mjs`가 HTML, sitemap, robots, 404를 `out/`에 생성한다.
5. `scripts/verify-static-output.mjs`가 생성된 정적 산출물을 검증한다.

## 근거

이 방식은 공개 app repo에서 데이터 본문 노출을 막으면서도, 빌드에 사용된 데이터 commit을 submodule pointer로 재현할 수 있게 한다. 데이터 변경은 private data repo의 commit으로 남고, app repo에는 해당 데이터 snapshot을 가리키는 pointer 변경만 남는다.

검토했지만 선택하지 않은 대안은 다음과 같다.

- 공개 app repo에 `projects.json` 유지: 가장 단순하지만 데이터 본문이 계속 공개 repo와 history에 남는다.
- 런타임 API 또는 원격 fetch 사용: 정적 사이트 요구사항보다 복잡하고, Cloudflare Pages 정적 배포의 단순성이 줄어든다.
- Cloudflare Pages Git integration에서 private submodule 직접 checkout: submodule 인증을 별도로 맞춰야 하므로 현재 direct upload 또는 GitHub Actions 기반 배포보다 운영이 복잡하다.

이 결정은 다음 가정을 전제로 한다.

- 빌드 환경은 private data repo를 checkout할 권한을 가진다.
- 공개 repo의 과거 commit에 이미 들어간 데이터 노출은 이 결정만으로 삭제되지 않는다.
- 과거 history 정리가 필요하면 별도 승인 후 `git filter-repo` 또는 BFG 기반 history rewrite와 force push를 수행한다.

## 결과

데이터 수정 절차는 data repo와 app repo를 순서대로 갱신하는 방식이 된다.

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

긍정적 결과는 다음과 같다.

- 공개 app repo에는 데이터 본문이 아니라 submodule pointer만 남는다.
- 어떤 데이터 snapshot으로 사이트가 빌드됐는지 재현할 수 있다.
- 데이터 형식이 깨지거나 `data/projects.json`이 없으면 `pnpm validate:data`와 `pnpm build`가 즉시 실패한다.

부정적 결과는 다음과 같다.

- 데이터 수정만 있어도 private data repo commit과 app repo submodule pointer commit이 모두 필요하다.
- private repo 권한이 없는 환경에서는 submodule checkout이 실패한다.
- 이미 공개된 과거 Git history의 데이터는 별도 history rewrite 없이는 제거되지 않는다.
