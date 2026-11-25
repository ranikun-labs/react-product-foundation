# Cloudflare Workers 배포 템플릿 (선택 구성)

> **선택 구성이다.** RPF는 배포 대상을 정하지 않는다. 이 문서와 `wrangler.template.jsonc`는 두 제품(Finance, Carelog)이
> 거의 같은 `wrangler.jsonc`를 각자 작성한 것을 근거로 한 출발점이며, 이 저장소에서 실제 배포를 실행하거나 검증하지 않았다(`NOT_RUN`).
> 두 제품이 실제로 어떤 경로(Git 연동 등)로 배포를 트리거하는지는 확인하지 못했다.

## 1. 두 제품의 공통부 (근거)

| 항목                        | 값                        | 비고                                |
| --------------------------- | ------------------------- | ----------------------------------- |
| `assets.directory`          | `./dist`                  | Vite 빌드 산출물                    |
| `assets.not_found_handling` | `single-page-application` | SPA fallback                        |
| `compatibility_date`        | `2026-11-19`              | 두 제품 동일                        |
| `name`                      | 제품별 `*-dev`            | 제품마다 다름. 템플릿은 placeholder |

제품별로만 있는 설정(템플릿에 넣지 않음): Carelog의 `workers_dev: false`, `preview_urls: true`, 빈 `previews`.
필요하면 제품이 직접 추가한다. 그 값이 필요한 이유는 제품이 판단한다.

## 2. 사용 방법

1. `wrangler.template.jsonc`를 `wrangler.jsonc`로 복사한다.
2. `name`을 제품 Worker 이름으로 바꾼다(소문자·숫자·`-`).
3. `compatibility_date`는 배포 시점에 검증한 날짜로 올린다.
4. 빌드 산출물이 `dist/`인지 확인한다(`pnpm run build`). 이 저장소는 `dist/<locale>/**/index.html` prerender 결과도 `dist/`에 만든다.

## 3. 넣지 않는 것 (규칙)

- `account_id`, API 토큰, Secret은 이 파일과 저장소에 쓰지 않는다. 인증은 CI의 Secret 또는 로컬 로그인으로 주입한다.
- `VITE_*` 값은 빌드 시점에 번들에 들어가며 공개된다. Secret을 두지 않는다(`docs/conventions/app-conventions.md`).
- 이 저장소의 PR 검증 워크플로는 배포를 하지 않는다. 배포 자동화는 제품이 Owner 승인 후 별도로 추가한다.

## 4. 알려진 한계 / 확인 필요

- prerender된 정적 HTML과 SPA fallback이 함께 동작하는 경로 우선순위는 Cloudflare 문서 기준으로 제품에서 확인한다(미검증).
- `wrangler deploy` 전 `wrangler deploy --dry-run`으로 설정 오류를 먼저 확인한다(이 PR에서는 실행하지 않음).
- 환경 분리(dev/prod Worker 이름, 도메인)는 제품 결정이다.
