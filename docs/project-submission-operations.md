# 프로젝트 등록 운영 설정

이 문서는 `/submit/` 프로젝트 등록 기능을 새 환경에 구성하거나 키를 교체할 때 필요한
Cloudflare와 GitHub 설정을 정리한다. 실제 secret 값은 저장소나 문서에 기록하지 않는다.

## 구성 흐름

1. 브라우저가 GitHub Actions 빌드 시 주입된 Turnstile sitekey로 위젯을 표시한다.
2. Pages Function이 Cloudflare Pages의 Turnstile secret으로 제출 토큰을 검증한다.
3. 검증된 요청을 D1 binding `SUBMISSION_DB`를 통해 `project_submission` 테이블에 저장한다.
4. 운영자는 Wrangler로 `pending` 요청을 조회하고 공개 데이터에 필요한 내용을 직접 반영한다.

## 값 분류

| 등록 위치 | 종류 | 이름 | 입력할 값 | 공개 여부 |
| --- | --- | --- | --- | --- |
| Cloudflare Pages Production | D1 binding | `SUBMISSION_DB` | D1 데이터베이스 `soma-projects` | 비밀 아님 |
| Cloudflare Pages Production | Variable | `TURNSTILE_EXPECTED_HOSTNAME` | `swmaestroproject.org` | 비밀 아님 |
| Cloudflare Pages Production | Secret | `TURNSTILE_SECRET_KEY` | Turnstile 위젯의 secret key | 비밀 |
| GitHub `Production` environment | Variable | `VITE_TURNSTILE_SITE_KEY` | 같은 Turnstile 위젯의 sitekey | 공개 가능 |
| GitHub `Production` environment | Variable | `CLOUDFLARE_ACCOUNT_ID` | Pages 프로젝트가 속한 Cloudflare account ID | 비밀 아님 |
| GitHub `Production` environment | Secret | `CLOUDFLARE_API_TOKEN` | Pages 배포 권한이 있는 Cloudflare API token | 비밀 |
| GitHub `Production` environment | Secret | `SOMA_PROJECTS_DATA_DEPLOY_KEY_B64` | private data 저장소용 SSH private deploy key의 Base64 값 | 비밀 |

`VITE_TURNSTILE_SITE_KEY`는 브라우저 번들에 포함되므로 secret으로 등록할 필요가 없다.
반대로 `TURNSTILE_SECRET_KEY`, API token, SSH private key는 브라우저와 저장소에 노출하면 안 된다.

## 1. Turnstile 위젯

Cloudflare Dashboard에서 **Turnstile > Add widget**으로 이동해 다음과 같이 생성한다.

- Widget name: 식별하기 쉬운 이름. 예: `soma-projects-production`
- Hostname: `swmaestroproject.org`
- Widget mode: `Managed`

Hostname에는 `https://`, port, path를 붙이지 않는다. 생성 후 표시되는 두 값은 다음 위치에 나눠 등록한다.

- **Sitekey**: GitHub `Production` environment의 `VITE_TURNSTILE_SITE_KEY`
- **Secret key**: Cloudflare Pages Production의 encrypted `TURNSTILE_SECRET_KEY`

Preview 배포에서도 폼을 테스트하려면 Turnstile 허용 hostname에 `soma-projects.pages.dev`를 추가한다.
루트 hostname을 허용하면 그 아래 branch subdomain도 허용된다. Preview hostname은 배포마다 달라질 수 있으므로
Preview 환경에는 고정된 `TURNSTILE_EXPECTED_HOSTNAME`을 등록하지 않는다.

## 2. Cloudflare Pages

Cloudflare Dashboard에서 **Workers & Pages > soma-projects > Settings**로 이동한다.

### D1 binding

Production 환경의 **Bindings > Add > D1 database**에서 다음 값을 선택한다.

- Variable name: `SUBMISSION_DB`
- D1 database: `soma-projects`

원격 데이터베이스의 UUID는 [`wrangler.remote.jsonc`](../wrangler.remote.jsonc)를 단일 기준으로 사용한다.
데이터베이스를 새로 만들었을 때만 이 파일의 `database_id`를 새 UUID로 바꾼다.

Preview의 등록 폼을 실제로 테스트할 때만 Preview 환경에도 binding을 추가한다. Production D1을 그대로
연결하면 테스트 제출도 운영 queue에 섞이므로, 자주 테스트한다면 별도 Preview D1을 사용하는 편이 안전하다.

### Variables and Secrets

Production 환경의 **Variables and Secrets**에 다음 두 항목을 등록한다.

1. `TURNSTILE_EXPECTED_HOSTNAME`
   - Type: Variable
   - Value: `swmaestroproject.org`
2. `TURNSTILE_SECRET_KEY`
   - Type: Secret 또는 Encrypt
   - Value: Turnstile 위젯에서 발급된 secret key

`TURNSTILE_EXPECTED_HOSTNAME`은 서버가 Turnstile 검증 응답의 hostname을 정확히 비교할 때 사용한다.
custom domain을 바꾸면 Turnstile 허용 hostname과 이 값도 함께 바꿔야 한다.

Binding, variable, secret을 바꾼 뒤에는 새 Pages deployment가 필요하다.

## 3. GitHub Actions

`wibaek/soma-projects`에서 **Settings > Environments > Production**으로 이동한다.
배포 workflow가 `Production` environment를 사용하므로 아래 항목도 같은 environment에 등록한다.

### Environment variables

#### `VITE_TURNSTILE_SITE_KEY`

- 값: Cloudflare Turnstile 위젯의 sitekey
- 용도: Vite 빌드 시 등록 폼의 클라이언트 번들에 포함
- 주의: 값을 바꾸면 반드시 GitHub Actions로 다시 빌드하고 배포

#### `CLOUDFLARE_ACCOUNT_ID`

- 값: `soma-projects` Pages 프로젝트가 속한 Cloudflare account ID
- 조회: Cloudflare Dashboard의 Account 또는 Zone Overview에 표시되는 **Account ID**
- 주의: account ID는 식별자이지 인증 수단이 아니므로 variable로 저장

### Environment secrets

#### `CLOUDFLARE_API_TOKEN`

Cloudflare Dashboard의 **API Tokens > Create Token > Custom Token**에서 만든다.

- Permission: **Account > Cloudflare Pages > Edit**
- Resource: `soma-projects`가 속한 account로 제한
- 값: 생성 완료 화면에서 한 번 표시되는 API token

이 secret은 GitHub Actions가 `wrangler pages deploy`로 `out/`을 업로드할 때 사용한다.
D1 migration은 이 workflow가 수행하지 않으므로 schema 변경은 배포 전에 별도로 적용한다.

#### `SOMA_PROJECTS_DATA_DEPLOY_KEY_B64`

정적 빌드가 private `wibaek/soma-projects-data` submodule을 읽기 위한 read-only SSH deploy key다.

처음 만드는 경우 저장소 밖에서 전용 키를 생성한다.

```bash
ssh-keygen -t ed25519 -C "soma-projects GitHub Actions" \
  -f ~/.ssh/soma-projects-data-deploy -N ""
```

1. `wibaek/soma-projects-data`의 **Settings > Deploy keys > Add deploy key**로 이동한다.
2. `~/.ssh/soma-projects-data-deploy.pub` 내용을 붙여 넣는다.
3. 빌드에는 읽기만 필요하므로 **Allow write access**를 선택하지 않는다.
4. private key를 한 줄 Base64로 변환한다.

```bash
base64 < ~/.ssh/soma-projects-data-deploy | tr -d '\n'
```

5. 출력 전체를 GitHub environment secret `SOMA_PROJECTS_DATA_DEPLOY_KEY_B64`의 값으로 등록한다.

private key 원문이나 Base64 결과는 저장소, 문서, 이슈, PR에 붙이지 않는다. Workflow는 원문용
`SOMA_PROJECTS_DATA_DEPLOY_KEY`도 지원하지만, 줄바꿈 문제를 줄이기 위해 현재 운영 구성처럼 Base64 항목
하나만 사용하는 것을 권장한다.

## 4. D1 생성과 migration

기존 `soma-projects` D1이 있으면 새로 만들지 않는다. 새 Cloudflare account에 처음 구성할 때만 실행한다.

```bash
pnpm exec wrangler login
pnpm exec wrangler d1 create soma-projects
```

출력된 `database_id`를 [`wrangler.remote.jsonc`](../wrangler.remote.jsonc)에 반영한 뒤 migration을 적용한다.

```bash
pnpm d1:migrate:remote
```

로컬 migration은 운영 UUID와 무관한 [`wrangler.local.jsonc`](../wrangler.local.jsonc)를 사용한다.

```bash
pnpm d1:migrate:local
```

Schema가 바뀌는 배포는 **migration 적용 후 코드 배포** 순서를 지킨다.

## 5. 배포와 확인

1. Cloudflare Pages와 GitHub `Production` environment 설정을 저장한다.
2. 필요한 D1 migration을 원격에 적용한다.
3. 변경을 `main`에 반영하거나 GitHub Actions의 **Cloudflare Pages Deploy** workflow를 실행한다.
4. GitHub Actions에서 submodule checkout, build, Pages deploy가 모두 성공했는지 확인한다.
5. `https://swmaestroproject.org/submit/`에서 Turnstile과 제출 동작을 확인한다.
6. 테스트 제출이 D1에 들어왔는지 확인한다.

```bash
pnpm d1:queue
```

특정 접수의 전체 내용을 조회할 때는 ID를 사용한다.

```bash
pnpm exec wrangler d1 execute soma-projects --remote \
  --config wrangler.remote.jsonc \
  --command "SELECT * FROM project_submission WHERE id = 'sub_...'"
```

GitHub에는 값이 아닌 등록된 이름만 안전하게 확인할 수 있다.

```bash
gh variable list --repo wibaek/soma-projects --env Production
gh secret list --repo wibaek/soma-projects --env Production
```

배포는 성공했지만 이전 화면이 보이면 Cloudflare의 최신 production deployment가 맞는지 먼저 확인하고,
브라우저 강력 새로고침 또는 query parameter를 붙인 URL로 cache 여부를 확인한다.

## 6. 로컬 테스트 값

로컬에서는 운영 키 대신 Cloudflare 공식 테스트 키가 들어 있는 예시 파일을 복사한다.

```bash
cp .env.example .env
cp .dev.vars.example .dev.vars
```

- `.env`: 공개 테스트 sitekey `VITE_TURNSTILE_SITE_KEY`
- `.dev.vars`: 테스트 `TURNSTILE_SECRET_KEY`, `TURNSTILE_EXPECTED_HOSTNAME=localhost`

`.env`와 `.dev.vars`는 Git에서 제외되어 있다. 운영 secret을 로컬 파일에 복사하지 않고, 테스트 키를
운영 GitHub 또는 Cloudflare 환경에 등록하지 않는다.

## 키 교체 범위

- Turnstile 위젯을 교체하면 GitHub의 sitekey와 Cloudflare Pages의 secret key를 함께 바꾸고 재배포한다.
- Cloudflare API token을 교체하면 GitHub의 `CLOUDFLARE_API_TOKEN`만 바꾸고 workflow를 재실행한다.
- data deploy key를 교체하면 private 저장소의 public deploy key와 GitHub의 Base64 secret을 함께 바꾼다.
- custom domain을 바꾸면 Turnstile hostname과 `TURNSTILE_EXPECTED_HOSTNAME`을 함께 바꾼다.

## 공식 문서

- [Cloudflare Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Cloudflare Pages Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare Turnstile widget 관리](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/)
- [Cloudflare Turnstile hostname 관리](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)
- [Cloudflare Turnstile 테스트 키](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
- [GitHub deployment environment 관리](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- [GitHub deploy key 관리](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys)
