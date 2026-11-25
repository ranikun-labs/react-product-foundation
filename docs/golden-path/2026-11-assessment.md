# Golden Path 현황 평가 (2026-11)

> **비정본 · 분석 문서.** 이 문서는 RPF를 Golden Path(Starter Foundation)로 발전시킬지 판단하기 위한
> 2026-11-25 시점의 분석이며 표준·계약이 아니다. 여기의 분류와 제안은 Owner 결정 전까지 어떤 저장소의
> 정본도 바꾸지 않는다. 수치 중 "(추정)"은 파일·라인 수에서 유추한 값이고 실측 공수가 아니다.

## 0. 목적과 범위

신규 React 제품이 매번 같은 기반 작업을 반복하지 않게 하려면 RPF에 무엇이 이미 있고, 무엇이 제품에서 검증됐으며,
무엇은 건드리지 말아야 하는지 구분해야 한다. 이를 위해 아래 세 저장소를 같은 기준으로 비교했다.

| 저장소 | 비교 기준 | 비고 |
| --- | --- | --- |
| `react-product-foundation` (RPF) | `origin/main` = `0b821ea` (2026-11-09 이후 정지) | Finance step9 태그에서 추출 (`docs/provenance.md`) |
| `finance-harness-fe` | `origin/dev` = `2ae32e3` | RPF의 원천 |
| `carelog-fe` | `origin/dev` = `9c3a028` | RPF `v0.1.0` archive 파생 (`docs/provenance.md`) |

방법은 추적 파일 목록, 설정·스크립트 파일의 바이트 비교, `import.meta.env`·`fetch`·상태관리 라이브러리 grep이다.
앱을 실행하거나 CI를 돌리지는 않았다(NOT_RUN). 따라서 "동작한다"가 아니라 "코드에 있다"만 주장한다.

분류 기호: ① RPF가 이미 제공 · ② 승격 후보(두 제품 모두 같은 패턴) · ③ 보완 필요 · ④ 제품별 선택 옵션 · ⑤ 현재 규모에서 과설계.

## 1. 영역별 분류

| 영역 | 분류 | 판단 한 줄 | 근거 파일 |
| --- | --- | --- | --- |
| 기술 스택 | ① | 세 저장소 동일(React 19.2.8·Vite·TS·Tailwind 4·pnpm 11). RPF가 기준선 | 각 저장소 `package.json` |
| 프로젝트 구조 | ① + ④ | `app/components/constants/i18n/pages` 골격은 RPF가 제공. Finance `features/*`, Carelog `auth/domain/integrations/adapters`는 제품 소유 | RPF `src/`, Finance `src/features/`, Carelog `src/{auth,domain,integrations}/` |
| Routing(공개·앱) | ① | `/:locale` 공개 + `/app/*` + `routes.ts` 단일 원본이 세 곳 동일 | `src/constants/routes.ts`, `src/app/AppRouter.tsx` |
| Routing(인증·보호) | ③ + ④ | RPF에 인증 라우트·보호 가드가 없다. Finance는 `/auth` 단일 진입 + 라우트별 `AuthRequiredSurface`, Carelog는 `/auth/{entry,login,signup}` + `Navigate` 가드로 **패턴이 다르다** | Finance `src/constants/routes.ts`·`src/features/auth/`, Carelog `src/constants/routes.ts`·`src/app/AppRouter.tsx` |
| Authentication | ④ (+⑤) | Finance는 reference auth 플래그, Carelog는 `AuthProvider`+상태기계+port+in-memory adapter. 공유할 공통 구현 없음. 상태기계 승격은 과설계 | Finance `src/features/auth/financeReferenceAuth.ts`, Carelog `src/auth/authStateMachine.ts`·`AuthProvider.tsx` |
| API Client·오류 처리 | ③ (공통 클라이언트는 ⑤) | 제품 간 공유 HTTP 클라이언트는 없다. Carelog는 자체 `createCarelogHttpClient`(401 재시도, session provider, envelope 처리)를 보유하고, Finance는 `fetch(` 직접 호출이 로컬 분석 1곳뿐이다. Carelog 구현이 Carelog API 계약에 묶여 있고 Finance에는 대응 사례가 없어 승격 불가(⑤). 오류 모양·https 강제 규칙만 문서화(③) | Finance `src/features/general-analysis/LocalGeneralAnalysis.tsx`, Carelog `src/integrations/carelog/httpClient.ts`·`authPort.ts` |
| 상태 관리 | ① (라이브러리 추가는 ⑤) | 세 곳 모두 상태 라이브러리 없음(Context/로컬 상태). 현 규모에서 도입 불필요 | 각 `package.json` dependencies, Carelog `src/components/layout/ProductionStateProviders.tsx` |
| 환경 설정(DEV/PROD) | ③ | RPF는 `vite-env.d.ts`뿐. Finance는 `VITE_FINANCE_*` 기능 플래그, Carelog는 `VITE_CARELOG_API_BASE_URL`+`PROD`일 때 https 강제+`test` 모드로 서로 다르다. 공통은 "타입 선언된 `VITE_` 변수 + PROD 가드" 규약뿐 | Finance `src/vite-env.d.ts`, Carelog `src/integrations/carelog/authPort.ts`, RPF `src/vite-env.d.ts` |
| UI / Design System 연결 | ② | RPF는 shadcn 원형 3개(button/badge/card, 146줄). Finance는 ui 13종, Carelog는 10종을 **복사**하고 sha256 lock+drift 테스트로 지킨다("공유 패키지가 생기면 삭제" 명시). 복사 모델의 한계가 이미 드러남 | RPF `src/components/ui/`, Carelog `design-foundation.lock.json`·`src/components/ui/design-foundation-drift.test.ts` |
| Theme(Light/Dark) | ② | 두 제품 모두 system/light/dark + localStorage + `.dark` + `color-scheme` + `theme-color` + `index.html` 인라인 깜빡임 방지 스크립트. RPF 없음 | Finance `src/theme/theme.ts`, Carelog `src/theme/themePreference.ts`, 각 `index.html` |
| Theme(Brand·Density) | ④ (런타임 스위치는 ⑤) | 런타임 전환이 아니라 `globals.css` 토큰 값 차이다(Finance 블루, Carelog Teal+Compact 컨트롤 44). `data-brand`·`data-density` 속성은 어느 쪽에도 없다 | Finance `src/styles/globals.css`, Carelog `src/styles/globals.css` |
| Adaptive Layout | ④ | 규칙이 다르다. Finance는 768/1024/1280 `BREAKPOINTS`+`AdaptiveShell`, Carelog는 `adaptiveHostModel`의 two-pane(가용폭 1100 이상+가로). RPF는 `AppShell`+`BottomNavigation`만 | Finance `src/constants/layout.ts`, Carelog `src/components/layout/adaptiveHostModel.ts` |
| Lint·Format·TS | ① (+③) | `prettier.config.js`·`tsconfig.json`·`components.json`은 세 곳 바이트 동일. `eslint.config.js`는 Finance/Carelog 간 14줄 차이로 의도 확인 필요 | 각 `prettier.config.js`, `tsconfig.json`, `eslint.config.js` |
| 테스트(Unit) | ① | Vitest+Testing Library+jsdom 세팅 동일 | RPF `vite.config.ts`, `src/test/setup.ts` |
| 테스트(E2E) | ① + ④ | RPF는 Playwright 1스펙. Finance는 harness별 config 4개, Carelog는 real-api config. 제품 시나리오라 승격 대상 아님 | RPF `e2e/foundation.spec.ts`, Finance `playwright.*.config.ts`, Carelog `playwright.real-api.config.ts` |
| 빌드(Vite·prerender) | ① (+③) | RPF의 `scripts/prerender.mjs`는 Carelog와 바이트 동일, Finance와는 차이. `verify-prerender-output.mjs`는 세 곳 모두 다름. RPF는 정지 상태라 제품 쪽 개선을 못 받고 있다 | `scripts/prerender.mjs`, `scripts/verify-prerender-output.mjs` |
| 배포(CI) | ② | RPF에 `.github/workflows`가 없다. 두 제품 모두 PR에서 pnpm 11.15.1·Node 22.23.1로 lint/typecheck/test/build를 돌린다. Carelog만 action SHA 고정+로그 아티팩트 | Finance `.github/workflows/dev-frontend-verify.yml`, Carelog `.github/workflows/carelog-fe-ci.yml` |
| 배포(Cloudflare Workers) | ② | 두 제품 모두 `wrangler.jsonc`가 거의 같다(`dist` 정적 자산, SPA fallback, `compatibility_date` 2026-11-19, 이름 `*-dev`). RPF 없음. 실제 배포 트리거(Git 연동 등)는 저장소에서 확인 못 함 | Finance·Carelog `wrangler.jsonc` |
| 모바일(Capacitor) | ① | `capacitor.config.ts`, `cap:sync`가 있다(세 곳 설정 차이 9줄 내외). `ios/android`는 저장소에 없고 `.prettierignore`에만 언급. 실기기 검증은 이번에 확인하지 않았다 | `capacitor.config.ts`, `package.json` scripts |
| AI 개발 계약 | ③ | **`AI_START_HERE` 파일은 세 저장소 어디에도 없다**(grep 0건). RPF `AGENTS.md`는 PR 작성 규칙 11줄뿐. Finance만 `CLAUDE.md`(routes 단일 원본·nav-map·로드맵)를 가진다 | RPF `AGENTS.md`, Finance `AGENTS.md`·`CLAUDE.md`, Carelog `AGENTS.md` |

## 2. 두 제품 간 실제 일치 정도 (승격 판단의 근거)

바이트 비교와 라인 차이 요약이다.

- 같은 파일(RPF 대비): Carelog는 `prerender.mjs`·`tsconfig.app.json`·`entry-server.tsx`·`TabLayout.tsx`·`fonts.css`·`prerender/manifest.ts`가 RPF와 동일, Finance는 `prettier`·`tsconfig.json`·`components.json`·`PageHeader`·`EmptyState`·`lib/utils.ts`가 동일.
- Finance와 Carelog 간 `components/ui/*` 중 8종(card, error-state, field-message, info-row, notice, section-header, select-chip, text-field)은 출처 헤더 1줄 외 동일. `button`(19줄)·`badge`(15줄)는 Carelog가 `primary` alias 등 로컬 패치를 갖는다(`design-foundation.lock.json`의 `derived`).
- 크게 갈라진 파일: `globals.css`(425줄 차이: 토큰 이름은 같고 값이 다름), `dictionary.ts`(759줄: 도메인 문구), `BottomNavigation`(205), `AppShell`(169).
- 유의: Carelog는 Finance의 UI를 복사해 온 파생이므로 "두 제품에서 독립 검증"의 강도는 완전한 독립 두 사례보다 약하다. 아래 승격 후보는 이 점을 감안한 판단이다.

## 3. 승격 후보 (같은 패턴일 때만)

| 순위 | 후보 | 어디로 | 근거 | 보류 조건 |
| --- | --- | --- | --- | --- |
| 1 | 공통 UI 컴포넌트(8종 verbatim + button/badge) | **RPF가 아니라 패키지**(`@ranikun-labs/react-ui` 후보) | 복사본 sha256 lock과 drift 테스트가 이미 "패키지가 생기면 삭제"를 전제로 존재 | 패키지 미게시. 게시 전에는 RPF에 8종을 복사하지 않는다 |
| 2 | Theme 런타임(system/light/dark, 저장, DOM 반영) | 패키지(저장 키 주입 형태) + RPF `index.html` 스니펫 | 두 제품 모두 구현·테스트 보유, 값(`THEME_COLOR`)까지 동일 | 4장의 설계 차이를 해소해야 함 |
| 3 | `wrangler.jsonc` 템플릿 + 최소 PR 검증 워크플로 | RPF | 두 제품이 같은 형태(두 제품 각각 작성한 흔적) | 실제 배포 경로 확인 후 이름 placeholder화 |
| 4 | 시맨틱 토큰 이름 체계(`--page`·`--brand-deep` 등) | 패키지(CSS 토큰) | 두 `globals.css`가 같은 이름에 다른 값을 둔다(브랜드·밀도만 제품 값) | 토큰 정본은 `ranikun-labs/design-system@021e40e61ab19a487133d903fae7412eb2a135cb`에 존재한다. 이 분석 세션은 접근하지 못해 내용 대조는 NOT_VERIFIED |
| 5 | AI 계약(경로 단일 원본·도메인 로직 금지·verify 절차) | RPF `AGENTS.md` | Finance `CLAUDE.md`가 같은 규칙을 이미 문서화. 정책은 oh-my-ai, 레포 규칙은 RPF | 증거가 Finance 1곳뿐이라 "제품에서 검증" 요건은 약함. 문서만 승격 |

승격하지 않는 것: 인증(Finance/Carelog 패턴 상이), Adaptive 규칙(상이), API 클라이언트(Carelog 자체 구현만 있고 Finance에 같은 패턴 없음), E2E harness(제품 시나리오), `verify-build-idempotency`(Finance 1곳뿐).

## 4. Theme 모듈 비교와 승격 방안

| 항목 | Finance (`src/theme/`) | Carelog (`src/theme/`) |
| --- | --- | --- |
| 파일 | `theme.ts`(161줄)+`useTheme.ts`+테스트 2종 | `themePreference.ts`(60)+`ThemeProvider.tsx`(71)+테스트 2종 |
| 상태 모델 | 모듈 레벨 외부 스토어 + `useSyncExternalStore`, Provider 불필요, `initTheme()` | `ThemeProvider` Context + `useState`, Provider 밖 `useTheme`는 throw |
| 저장 키 | `finance-harness:theme` | `carelog.theme` |
| 저장값 없음 | `null` 반환, `system` 선택 시 키 삭제 | `'system'` 반환, `system`도 키에 기록 |
| 저장 결과 | `{ persisted: boolean }` 반환(실패 인지 가능) | 반환 없음, 실패를 조용히 무시 |
| DOM 반영 | `.dark` + `color-scheme` + `meta[color-scheme]` + `meta[theme-color]` | `.dark` + `color-scheme` + `meta[theme-color]` |
| SSR/prerender | 서버 스냅샷(`'system'`, `'light'`) 제공 | Provider 초기값이 `window` 접근을 `try`로 감쌈 |
| 탭 간 동기화·시스템 변경 | 둘 다 지원 | 둘 다 지원 |
| 깜빡임 방지 | `index.html` 인라인 스크립트, 테스트가 대조 | 동일 방식 |
| 색 상수 | light `#f2f4f6` / dark `#0f1114` | 동일 |
| 전환 UI 위치 | `components/layout/ThemeSwitcher.tsx` | `SettingsPage.tsx` 안 |

차이는 대부분 우연한 구현 차이이고 규칙(3상태, `.dark` 클래스, 색 상수, 인라인 스크립트)은 동일하다.

**추천: Finance의 외부 스토어 방식을 기반으로 패키지화하고, 저장 키만 주입한다.** 이유는 Provider 없이 prerender 서버 스냅샷을 안전하게 처리하고 저장 실패를 호출자가 알 수 있기 때문이다. 버리는 것은 Carelog의 Provider 구조이며, 제품에서 `ThemeProvider` 래퍼가 필요하면 얇게 다시 만들면 된다.

순서(작은 단계부터):

1. design-system(또는 패키지)에 `createThemeStore({ storageKey, colors })`와 `useTheme`을 추가한다. 기존 두 구현의 테스트를 합쳐 기준 테스트로 쓴다.
2. `index.html` 인라인 스크립트는 패키지로 만들지 않고 RPF 템플릿에 두며, 키·색을 맞추는 대조 테스트(현재 `theme.test.ts` 방식)를 템플릿에 포함한다. 스크립트 생성기·Vite 플러그인은 만들지 않는다.
3. Finance, Carelog가 각자 `src/theme/`를 패키지 호출로 교체한다. 저장 키는 기존 값을 그대로 넘겨 **사용자의 저장 선택이 유지**되게 한다(키 변경 시 선택 초기화됨).
4. 마지막에 RPF가 같은 패키지를 소비한다.

실패모드: 키 불일치로 사용자 설정 초기화, `index.html` 스크립트와 런타임 규칙 어긋남(대조 테스트로 방지), 패키지 업데이트가 두 제품에 동시에 반영되지 않아 버전 분기.

Brand·Density는 이 모듈에 넣지 않는다. 두 제품의 차이가 토큰 값이며 런타임 전환 요구가 없다.

## 5. 신규 제품 시작 시 줄어드는 작업 (추정)

기준은 RPF만으로 시작하는 현재와, 3장 승격 후 상태의 비교다. 모든 값은 **(추정)**이며 파일·라인 수와 두 제품이 같은 작업을 반복한 흔적에서 유추했다. 실측하려면 다음 신규 제품 시작 시 시간을 기록해야 한다.

| 작업 | 현재 (추정) | 승격 후 (추정) | 근거 |
| --- | --- | --- | --- |
| UI 컴포넌트 10종 확보 + drift 가드 | 1~2일 | 0.25일 | Carelog `design-foundation.lock.json` 10건, 수동 복사·패치·hash 관리 |
| Light/Dark 테마 + 깜빡임 방지 + 테스트 | 0.5~1일 | 0.1일 | 두 제품 구현 합계 약 320줄+테스트 약 460줄 |
| CI 워크플로 + `wrangler.jsonc` | 0.5일 | 0.1~0.2일 | 두 제품이 각각 재작성 |
| AI 계약 문서 정리 | 0.5일 | 0.1일 | Finance `AGENTS.md` 42줄, Carelog `AGENTS.md` 12줄, RPF `AGENTS.md` 11줄로 편차 |
| 환경 변수 타입·PROD 가드 | 0.25일 | 변화 없음 | 현재 제품마다 달라 승격 안 함(③ 문서화만) |
| 합계 | 약 2.75~4.25일 | 약 0.8~0.9일 | 위 항목의 합(환경 변수 행 0.25일은 양쪽 포함) |

줄어들지 않는 것: 도메인 화면, 인증 연동, API 연동, 제품별 E2E, 제품별 Adaptive 규칙. 신규 제품의 본 작업은 거의 그대로다.

## 6. 다음 단계 제안

### 6.1 공통 UI 패키지 게시 후 RPF가 소비하도록 바꾸는 최소 변경

전제: 패키지명 후보 `@ranikun-labs/react-ui`가 게시되고 필요한 토큰 CSS를 export한다. 현재 RPF 쪽 사용처는 6개 파일, import는 `button` 4곳과 `card` 2곳이라 영향은 작다.

1. `package.json`: 패키지를 정확한 버전으로 추가하고 `class-variance-authority`·`clsx`·`tailwind-merge`·`tw-animate-css`는 패키지 peer/내장 여부에 맞춰 정리한다.
2. `src/components/ui/{button,badge,card}.tsx`(146줄) 삭제 후 import 6곳을 패키지로 교체한다. 한 PR에서 임시 re-export를 두면 롤백이 쉽다.
3. `src/styles/globals.css`: 패키지 토큰 CSS import와 Tailwind 4 `@source`로 패키지 클래스를 스캔시킨다. 빠뜨리면 빌드는 통과하지만 스타일이 빠진다.
4. `components.json`: 패키지 소비 방식에 맞게 shadcn alias 정리(필요 시 `ui` 경로 비움).
5. `scripts/verify-leakage.mjs`·`docs/provenance.md`: 패키지 출처 기록과 금지어 검사 범위 반영.
6. 패키지 레지스트리 인증(`.npmrc`)과 CI 설치 토큰. 개인 토큰이 템플릿에 남지 않게 한다.
7. 소비 후 `pnpm verify:full`을 실행하고 시각 회귀를 최소 1화면 확인한다.

소비 범위를 두 단계로 구분한다.

| 구분 | 내용 | 상태 |
| --- | --- | --- |
| S1 부분 소비(실증) | `Card`·`cn` 중심으로 패키지를 소비해 설치·스타일 스캔·빌드가 되는지 확인 | 실증 범위. 이것만으로 소비 완료가 아니다 |
| 전체 소비 완료 조건 | `Button`·`Badge`·`Card` 등 RPF `ui/` 전부를 패키지로 교체, 로컬 복사본 삭제, 토큰 CSS 소비, `pnpm verify:full` 통과, 시각 확인 | 미충족 |

### 6.2 권장 순서

(1) design-system 패키지 게시 → (2) RPF 소비(6.1) → (3) Theme 패키지 승격(4장) → (4) CI·`wrangler` 템플릿 추가 → (5) `AGENTS.md`·AI 시작 문서 정리 → (6) 제품 두 곳이 패키지 소비로 전환하며 lock·drift 테스트 제거.

### 6.3 하지 말 것

- 패키지 게시 전에 UI 컴포넌트를 RPF에 복사하지 않는다. 지금도 두 제품이 복사 후 갈라졌고, 템플릿 코드는 자동 갱신되지 않는다.
- 인증 상태기계·AuthProvider·API 클라이언트를 RPF로 올리지 않는다. 두 제품의 패턴이 달라 한쪽을 표준으로 강요하게 된다.
- Brand/Density 런타임 스위치, 테마 생성기, 템플릿 생성 CLI를 만들지 않는다. 현재 제품 2개 규모에서 유지 비용이 이득보다 크다.
- 상태관리·데이터 패칭 라이브러리를 템플릿에 기본 포함하지 않는다.
- Adaptive 레이아웃 규칙을 하나로 통일하지 않는다(Finance 768/1024/1280, Carelog two-pane 1100).
- RPF `main`에 Finance·Carelog `dev`를 통째로 병합해 "최신화"하지 않는다. 제품 도메인이 섞인다.
- 이 문서를 근거로 `v1.0.0` 등 표준 태그를 먼저 붙이지 않는다. Owner 결정 후에 한다.

### 6.4 후속 평가 대상과 최소 측정 기준

온보딩 외에 기능 개발·유지보수·최적화·디자인·AI 실행·개발 품질도 효과를 봐야 한다. 새 운영 업무를 만들지 않고 기존 CI 결과와 실행 보고(PR 본문 검증표)만 쓴다.

| 영역 | 측정 대상 | 수집 방법 |
| --- | --- | --- |
| 기능 개발 | 첫 화면~첫 PR까지 걸린 시간 | PR 생성 시각과 저장소 생성/브랜치 시각 |
| 유지보수 | 패키지 업데이트가 제품에 반영되는 데 걸린 시간, 복사본 drift 건수 | 제품 PR 이력, drift 테스트 실패 |
| 최적화 | 번들 크기, 빌드 시간 | CI build 로그 |
| 디자인 | 토큰·컴포넌트 일탈 수정 건수 | PR 리뷰 지적, 토큰 대조 테스트 |
| AI 실행 | 실행 중단·복구 건수, NOT_RUN 비율 | 실행 보고, PR 검증표 |
| 개발 품질 | CI 통과율, 재작업 커밋 수 | CI 이력, PR 커밋 수 |

신규 제품 1~2개에서 수동 기록으로 시작하고, 자동 수집은 필요가 확인된 뒤에 한다.

## 7. 과설계로 판단한 것 (현재 규모, 제품 2개)

- 런타임 Brand·Density 전환 시스템
- 공통 API 클라이언트(Carelog 구현의 템플릿 승격 포함)·상태관리 라이브러리 기본 탑재
- Finance·Carelog 인증 상태기계의 템플릿 승격
- 템플릿 자동 동기화 봇·생성 CLI(패키지 소비로 대체 가능)
- `index.html` 테마 스크립트의 패키지·플러그인화

## 8. 한계와 미확인

- 실행 검증 없음: `pnpm verify`, 빌드, E2E 모두 NOT_RUN. 모든 판단은 정적 비교 결과다.
- Cloudflare 실제 배포 트리거와 환경별(DEV/PROD) 설정은 저장소 파일만으로 확인되지 않았다.
- `ranikun-labs/design-system@021e40e`에 토큰 정본이 존재한다(Owner 확인). 이 분석 세션은 로컬 clone이 비어 있어 접근하지 못했고, 정본과 두 제품 `globals.css`의 대조는 NOT_VERIFIED다. 정본이 없다는 뜻이 아니다.
- Finance·Carelog는 같은 계보(Carelog가 Finance UI를 복사)라 "독립 두 제품 검증" 근거로는 제한적이다.
- `eslint.config.js` 차이 14줄의 의도는 읽지 않았다.
- Capacitor 네이티브 프로젝트 실기기 검증 여부는 확인하지 않았다.
- 공수 수치는 모두 추정이다.
