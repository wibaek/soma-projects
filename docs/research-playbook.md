# SOMA 프로젝트 반복 조사 플레이북

이 문서는 SW마에스트로/SOMA 프로젝트 조사를 하루 단위로 반복할 때의 운영 기준이다.
목표는 새 후보를 꾸준히 찾되, 근거 품질을 유지하고 임시 파일이 다시 늘어나지 않게 하는 것이다.

## 데이터 위치

- 공개 사이트가 실제로 읽는 데이터는 `data/projects.json`이다.
- `data/`는 private data repo submodule이다. 데이터 수정은 `data/` 안에서 먼저 커밋/푸시하고, app repo에는 submodule 포인터 변경을 남긴다.
- 예비 후보 DB는 `docs/tmp/soma-projects-research-summary.csv`이다.
- 조사 설명은 `docs/tmp/soma-projects-research-summary.md`에 둔다.
- 장기 조사 노트는 `docs/tmp/soma-projects-research-notes.md`에 append한다.
- 원천 파일을 꼭 남겨야 하면 새 batch 파일을 만들지 말고 `docs/tmp/soma-projects-research-source-index.csv`에 출처와 해시를 기록한다.

`docs/tmp/`는 git ignored 영역이다. 장기적으로 origin에 남길 운영 지식은 이 문서처럼 `docs/` 바로 아래나 `docs/adr/`에 둔다.

## 하루 조사 목표

하루 단위 조사에서 무리하게 메인 데이터까지 바로 반영하지 않는다. 기본 목표는 아래 순서다.

1. 아직 `reflected=false`인 후보의 근거를 보강한다.
2. 새 후보를 찾으면 canonical CSV에 직접 추가한다.
3. 중복, 후속 제품, 팀원 배경만 있는 제품을 분리한다.
4. 반영 가능한 high-confidence 후보만 모아 별도 변경 세트로 `data/projects.json`에 적용한다.
5. 조사 결과와 판단 근거를 notes에 짧게 남긴다.

같은 후보를 여러 날 재조회해도 신규 행, 업데이트, 병합, confidence 변경이 모두 0이면 그 후보는 반복 보류 대상으로 옮긴다. 이후에는 새 직접 근거가 발견되거나 사용자가 지목할 때만 다시 조사한다.

## 파일 운영 원칙

새 조사 라운드마다 파일을 여러 개 만들지 않는다. 이전에는 서브 에이전트별 batch CSV와 notes가 쌓여 250개 이상이 되었고, 사후 통합이 어려웠다.

- 후보 행은 항상 `soma-projects-research-summary.csv`에 직접 병합한다.
- 긴 설명, 실패 검색, 제외 판단은 `soma-projects-research-notes.md`에 날짜 섹션으로 추가한다.
- 외부 원본을 파일로 저장해야 할 때만 `/private/tmp` 또는 `docs/tmp/source-scratch/`를 임시로 쓰고, 작업 끝에는 summary/source-index/notes 중 하나로 흡수한 뒤 제거한다.
- 하루 작업이 끝났을 때 `docs/tmp` 파일 수는 5개 이하를 유지한다.

## 후보 DB 스키마

`soma-projects-research-summary.csv` 컬럼은 다음 순서를 유지한다.

```text
reflected,generation,title,type,description,project_url,rank_or_award,evidence_urls,evidence_note,confidence,update_at
```

작성 규칙:

- `reflected`: `data/projects.json`에 반영되었으면 `true`, 아니면 `false`.
- `generation`: 숫자를 우선한다. 불확실하면 `16?`, 정말 모르면 `unknown`.
- `title`: 제품명 또는 프로젝트명. 팀명만 있으면 팀명과 제품명을 함께 적는다.
- `type`: 조사 단계에서는 자유롭게 적어도 되지만, 메인 데이터 반영 시에는 `App`, `Web`, `기타` 중 하나로 정규화한다.
- `description`: 사용자가 이해할 수 있는 한 문장으로 제품/프로젝트 기능을 적는다.
- `project_url`: 대표 URL 하나. 없으면 비운다.
- `rank_or_award`: 우수 프로젝트, 공식 seed, 예비과정, 해커톤 등 판단에 필요한 분류.
- `evidence_urls`: 세미콜론으로 구분한 근거 URL. 비우지 않는다.
- `evidence_note`: 왜 이 후보를 믿거나 보류하는지 짧게 적는다.
- `confidence`: `high`, `medium`, `low`.
- `update_at`: `YYYY-MM-DD`.

CSV는 Excel/Numbers 호환을 위해 UTF-8 BOM과 CRLF를 유지하는 것이 좋다. Python으로 갱신할 때는 `encoding="utf-8-sig"`로 읽고 쓴다.

반복 보류, 반영 제외, weak evidence를 추적하기 위해 새 컬럼을 추가하지 않는다. 대신 `evidence_note` 또는 notes에 `동명이물`, `lineage 미달`, `AI 기술교육`, `예비/미니`, `store-only`, `team-background-only` 같은 짧은 태그를 남긴다.

## 신뢰도 기준

`high`는 공개 근거가 프로젝트와 SOMA lineage를 직접 연결할 때만 준다.

High 예시:

- 공식 SW마에스트로 프로젝트 페이지가 해당 프로젝트명과 팀을 직접 보여준다.
- GitHub README가 "SW마에스트로 N기 프로젝트"와 서비스명을 직접 말한다.
- 언론/학교/공식 블로그가 "SW마에스트로 N기 팀이 개발한 X"라고 말한다.
- 스토어/서비스 페이지와 공식 seed가 같은 팀명, 제품명, 패키지, 개발자 정보로 교차 확인된다.

Medium 예시:

- 제품 실체는 확실하고 팀명/개발자/조직명으로 SOMA와 연결되지만 직접 문장이 부족하다.
- 공식 seed는 있으나 외부 제품 URL이 같은 프로젝트인지 일부 추론이 필요하다.
- 리브랜딩/후속 제품으로 보이나 연결 근거가 한 단계 약하다.

Low 예시:

- 팀원 또는 창업자가 SOMA 출신이라는 배경만 있다.
- 제품명만 같고 세대, 팀, 저장소, 스토어 개발자 연결이 약하다.
- 예비과정, 미니 프로젝트, 해커톤, 내부 도구 성격이다.
- 검색 실패, 제외, 중복 후보를 기록해 둘 필요가 있다.

주의: 팀원/창업자 배경만 있는 제품은 본과정 프로젝트로 단정하지 않는다. package/support-email/GitHub org명만으로 high 승격하지 않는다.

## 반복 보류 기준

반복 보류는 검색을 포기한다는 뜻이 아니라, 같은 약한 근거를 매일 다시 확인하지 않기 위한 상태다. 아래 조건을 모두 만족하면 다음 큐에서 뺀다.

- 최소 3회 이상 같은 후보를 재조회했다.
- 신규 행, 기존 행 업데이트, 병합, confidence 변경이 모두 없었다.
- 실패 이유가 접근 제한, 동명이물, store-only, path-only, team-background-only처럼 기존 판단과 같다.

다시 조사하는 조건:

- 공식 SW마에스트로/SOMA 페이지, GitHub README, 언론, 학교/공식 블로그가 프로젝트명과 기수를 직접 연결하는 새 근거가 있다.
- store/package/support/privacy URL이 공식 seed의 팀명, 제품명, 개발자명과 새로 교차 확인된다.
- 사용자가 특정 후보를 지목한다.

반복 보류 후보는 notes와 handoff에 남기되, 일반 일일 조사에서는 새 후보 발굴이나 weak reflected 감사보다 뒤에 둔다.

## 감사 우선순위

이미 `data/projects.json`에 반영된 후보의 근거가 약하면 새 후보보다 먼저 점검한다. `reflected=true`이면서 `confidence=low` 또는 `medium`인 행은 사용자에게 보이는 데이터의 신뢰도 문제이므로 우선 감사 대상이다.

`reflected=false`, `confidence=high` 후보는 곧바로 메인 데이터 반영 대상으로 보지 않는다. 먼저 본과정/정식 프로젝트인지, 17기 AI 기술교육, 예비/미니 프로젝트, 해커톤, 내부 도구처럼 별도 보관할 후보인지 분류한다.

`generation=unknown` 후보는 새 URL을 더 찾기보다 기수 anchor 확보를 우선한다.

## 중복 처리

중복 판단은 보수적으로 한다.

- 같은 `generation + normalized title`이면 하나로 병합한다.
- 대표 URL이 같고 제품 설명도 같으면 하나로 병합한다.
- 팀명만 다르고 제품명이 같으면 공식 seed와 외부 제품 근거를 한 행으로 합친다.
- 같은 회사의 후속 제품이면 기존 프로젝트와 별도 행으로 두되 `evidence_note`에 lineage 한계를 적는다.
- 동일 회고 URL에 서로 다른 프로젝트가 함께 실린 경우에는 분리 유지한다.

병합할 때는 더 강한 confidence, 더 많은 근거 URL, 더 구체적인 설명을 가진 행을 기준으로 삼는다. 삭제한 별칭과 근거 URL은 `evidence_note` 또는 `evidence_urls`에 남긴다.

## 서브 에이전트 운영

하루 조사량이 많으면 서브 에이전트를 쓰되, 각 에이전트가 파일을 마음대로 만들게 두지 않는다. 에이전트의 산출물은 "행 후보"와 "제외 판단"이어야 한다.

좋은 분할 단위:

- 기수 범위: 1-4기, 5-8기, 9-12기, 13-16기, 17기 AI 기술교육.
- 소스 유형: 공식 페이지, GitHub, 앱스토어/플레이스토어, 언론/학교 기사, 블로그/회고/포트폴리오.
- 목적: 신규 후보 발굴, 기존 `reflected=false` 근거 보강, duplicate QA, low/medium 재판정.

나쁜 분할 단위:

- "아무거나 많이 찾아라."
- "각자 CSV 파일 만들어라."
- 여러 에이전트가 같은 후보 DB를 동시에 수정하게 하는 방식.
- 검색 결과 스니펫만 모으고 판단 기준을 쓰지 않는 방식.

권장 방식:

1. 메인 세션이 오늘의 범위와 금지 조건을 정한다.
2. 각 서브 에이전트는 읽기 전용으로 조사하고, 최종 응답에 CSV 행 후보를 fenced block으로 반환한다.
3. 메인 세션만 `soma-projects-research-summary.csv`를 수정한다.
4. 메인 세션이 duplicate/lineage/confidence를 다시 검토한다.
5. 하루 끝에 notes에 "오늘 조사 범위, 추가 행 수, 보류/제외 이유"를 기록한다.

서브 에이전트에게 줄 프롬프트 예시:

```text
SOMA 프로젝트 후보를 조사한다. 범위는 9-12기 GitHub/README 근거만이다.

반드시 지킬 것:
- 파일을 만들거나 수정하지 말 것.
- 결과는 아래 CSV 컬럼 순서의 행 후보만 반환할 것.
- evidence_urls는 비우지 말 것.
- 팀원/창업자 배경만 있으면 confidence=low로 둘 것.
- "SW마에스트로 N기 프로젝트"를 직접 말하는 근거가 있으면 high 후보로 표시할 것.
- 이미 canonical DB에 있을 가능성이 있으면 duplicate_note를 evidence_note에 적을 것.

컬럼:
reflected,generation,title,type,description,project_url,rank_or_award,evidence_urls,evidence_note,confidence,update_at

반환:
- 후보 CSV 행
- 제외/실패 검색 요약 5줄 이하
```

## 검색 노하우

반복 검색은 같은 키워드만 돌리면 중복이 늘어난다. 매일 소스 축을 바꾼다.

기본 접근은 "공식 seed -> 외부 실체 -> 교차 연결" 순서다.

1. 공식 seed에서 시작한다. 공식 SW마에스트로 페이지, 공식 블로그, 뉴스레터, 수료식/우수 프로젝트 기사에서 `기수`, `팀명`, `프로젝트명`, `멤버`를 anchor로 잡는다.
2. 외부 실체를 찾는다. 같은 seed를 GitHub, App Store, Google Play, 서비스 도메인, 언론, 학교 기사, 블로그/회고, LinkedIn/포트폴리오로 확장한다.
3. 교차 연결한다. `팀명`, `제품명`, `기수`, `GitHub org`, `package id`, `개발자명`, `지원 이메일`, `privacy URL`이 서로 맞물리는지 확인한다.
4. 보강과 신규 발굴을 분리한다. 기존 후보는 근거와 confidence를 올리는 데 집중하고, 신규 후보는 중복/후속 제품 여부를 먼저 확인한다.

새 후보 발견에는 GitHub/스토어/회고가 강하고, 기존 후보 보강에는 공식 seed/언론/학교 기사/포트폴리오가 강하다. 하루 안에서 둘을 섞으면 중복 판단이 흐려지므로, 오늘의 목표를 "신규 발굴" 또는 "기존 후보 보강" 중 하나로 먼저 정한다.

반복 보류 후보는 일반 검색 큐에 다시 넣지 않는다. 재조회 조건을 만족하지 않는다면 검색 시간을 weak reflected 감사, high 미반영 분류, unknown 기수 anchor 확보에 쓴다.

유용한 쿼리 패턴:

- `"SW마에스트로" "프로젝트명"`
- `"소프트웨어 마에스트로" "팀명"`
- `"Software Maestro" "project name"`
- `"SWM" "project name" GitHub`
- `site:github.com "SW Maestro" "기수"`
- `site:github.com "소프트웨어 마에스트로" "README"`
- `site:apps.apple.com "프로젝트명"`
- `site:play.google.com "프로젝트명"`
- `site:blog.naver.com "SW마에스트로" "프로젝트"`
- `site:tistory.com "소프트웨어 마에스트로" "프로젝트"`
- `site:linkedin.com/in "SW Maestro" "프로젝트명"`

검색 팁:

- 한국어/영어/약칭을 모두 시도한다: `SW마에스트로`, `소프트웨어 마에스트로`, `Software Maestro`, `SOMA`, `SWM`.
- 팀명, 제품명, 저장소 조직명, package id를 교차 검색한다.
- App Store/Google Play는 앱 설명보다 개발자명, package id, 지원 URL, privacy URL이 더 유용할 때가 많다.
- GitHub 조직명에 `SWM`, `SOMA`, `sw-maestro`, 기수 번호가 들어가도 본문 근거가 없으면 medium 이하로 둔다.
- 공식 seed와 외부 제품명이 다르면 바로 병합하지 말고 별칭 가능성을 evidence_note에 적는다.

## 메인 데이터 반영

`data/projects.json` 반영은 조사와 분리한다. 반영 대상은 보통 `reflected=false`, `confidence=high`, 본과정/정식 프로젝트 근거가 직접적인 행이다.

반영 전 체크:

- 예비/미니/해커톤/AI 기술교육 산출물이 아닌가?
- 같은 프로젝트가 이미 `data/projects.json`에 다른 이름으로 있는가?
- `type`을 `App`, `Web`, `기타` 중 하나로 정리했는가?
- `link` 또는 `links`가 유효한 HTTP(S) URL인가?
- 설명에 근거 없는 과장이 없는가?
- `rank`는 공식 우수 프로젝트 근거가 있을 때만 true인가?

반영 후 실행:

```bash
pnpm validate:data
pnpm typecheck
pnpm build
```

데이터 submodule을 수정했다면 `data/` 안에서 먼저 commit/push하고, app repo에서는 submodule 포인터를 commit한다.

## 하루 마감 체크리스트

- `soma-projects-research-summary.csv`가 읽히는가?
- `evidence_urls` 빈 행이 없는가?
- `(generation,title)` exact duplicate가 없는가?
- 새로 추가한 high 후보에 직접 lineage 근거가 있는가?
- `docs/tmp` 파일 수가 5개 이하인가?
- 오늘 한 조사 범위와 보류 이유를 notes에 남겼는가?
- 반복 보류 후보를 재조회했다면 재조회 조건을 명시했는가?
- `reflected=true` weak confidence 후보와 `reflected=false/high` 후보 분류 상태를 확인했는가?
- 메인 데이터 반영이 있었다면 `pnpm validate:data`, `pnpm typecheck`, `pnpm build`를 실행했는가?

검증용 Python 스니펫:

```bash
uv run python - <<'PY'
from pathlib import Path
import csv

path = Path("docs/tmp/soma-projects-research-summary.csv")
with path.open("r", encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))

keys = [(row["generation"].strip().lower(), row["title"].strip().lower()) for row in rows]
print(f"rows={len(rows)}")
print(f"duplicate_generation_title={len(keys) - len(set(keys))}")
print(f"missing_evidence_urls={sum(1 for row in rows if not row['evidence_urls'].strip())}")
PY
```
