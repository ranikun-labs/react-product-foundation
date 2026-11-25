# 프로젝트 구조와 코드 배치 규칙

> 이 문서는 RPF `src/`의 현재 구조와, 두 제품(Finance, Carelog)이 같은 골격 위에 무엇을 더했는지를 근거로 한 **규약**이다.
> 근거 시점은 `docs/golden-path/2026-11-assessment.md`(2026-11)이며, 이후 제품 변경은 반영하지 않았다.

## 1. RPF가 제공하는 골격 (규약)

| 위치                     | 책임                             | 규칙                                                                             |
| ------------------------ | -------------------------------- | -------------------------------------------------------------------------------- |
| `src/app/`               | 라우터 조립, 최상위 Provider     | 라우트 트리는 여기서만 조립한다                                                  |
| `src/constants/`         | 라우트·내비게이션 등 단일 원본   | `routes.ts`가 경로의 유일한 정의처. 파생 경로는 `build*Path` 함수로 만든다       |
| `src/pages/`             | 라우트에 1:1로 대응하는 화면     | `public/`은 `/:locale` 공개 웹, 그 외는 `/app/*` 화면                            |
| `src/components/layout/` | 앱 셸·탭·공개 레이아웃           | 도메인 지식을 넣지 않는다                                                        |
| `src/components/ui/`     | 프리미티브 UI                    | 디자인 시스템 유래 코드. 직접 개조하기 전에 `library-selection.md` 순서를 따른다 |
| `src/components/common/` | 도메인과 무관한 공용 조각        | 도메인 용어가 들어가면 `ui`나 `common`이 아니다                                  |
| `src/i18n/`              | 로케일·사전                      | 로케일 목록·검증은 `routes.ts`의 `SUPPORTED_LOCALES`가 원본                      |
| `src/lib/`               | 순수 유틸(`cn` 등)               | React·도메인에 의존하지 않는다                                                   |
| `src/styles/`            | `globals.css`(토큰), `fonts.css` | 토큰 이름은 디자인 시스템과 맞춘다. 컴포넌트에서 색 값을 하드코딩하지 않는다     |
| `src/prerender/`         | 공개 경로 prerender 목록         | 공개 경로를 추가하면 manifest와 `verify-prerender-output`를 함께 갱신한다        |
| `src/test/`              | 테스트 setup                     | 테스트 파일은 대상 옆에 `*.test.ts(x)`로 둔다                                    |

URL은 두 도메인으로 나눈다: 공개 웹 `/:locale/*`(정적 prerender 대상), 앱 `/app/*`(SPA). 프리픽스 없는 콘텐츠 경로는 두지 않는다.

## 2. 제품이 추가하는 영역 (선택지)

RPF에는 없고 제품이 필요할 때 만든 디렉터리다. 이름과 경계는 제품마다 다르다. **표준이 아니라 사례**다.

| 제품    | 추가 영역                                                                                              | 비고                                               |
| ------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Finance | `src/features/*`(도메인별 묶음), `src/theme/`, `src/mocks/`, `src/metadata/`                           | 기능 단위로 화면·상태·포트를 묶는 방식             |
| Carelog | `src/auth/`, `src/domain/`, `src/integrations/`, `src/adapters/`, `src/state/`, `src/theme/` 등 (일부) | 계층(인증·도메인·외부 연동·어댑터)으로 나누는 방식 |

권장 기준(추천 1개): **기능 단위 묶음(`features/*`)을 먼저 시도하고, 계층 분리는 외부 연동이 둘 이상이 되어 경계가 필요해질 때 도입**한다.
이유는 초기에는 파일 이동 비용이 적고 삭제가 쉽기 때문이다. 버리는 것은 처음부터 계층을 고정해 얻는 경계의 명확함이다.
Carelog 방식이 더 적합한 제품도 있으므로 강제하지 않는다.

## 3. 배치 판단 순서

1. 라우트 경로인가 → `src/constants/routes.ts`
2. 특정 화면 하나에서만 쓰는가 → 그 페이지 파일 또는 같은 폴더
3. 도메인 용어가 들어가는가 → 제품 영역(`features/*` 등). `components/ui`·`common`에 넣지 않는다
4. 도메인과 무관하고 둘 이상의 화면이 쓰는가 → `components/common` 또는 `lib`
5. 프리미티브 UI인가 → `components/ui` (디자인 시스템 유래, 개조 전 `library-selection.md` 확인)

## 4. 의존 방향

`pages → components/features → lib/constants`. 아래에서 위(`lib`가 `pages`를 import)로 거슬러 올라가지 않는다.
`components/ui`는 도메인·라우트·i18n 사전을 import하지 않는다.

## 5. 경로 별칭

`@/`는 `src/`를 가리킨다(`tsconfig.app.json`, `vite.config.ts`). 상대경로 `../../..`보다 별칭을 쓴다.
