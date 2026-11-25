# AI_START_HERE

이 저장소에서 작업을 시작하는 사람과 AI 에이전트의 진입점이다. 규칙 전문이 아니라 **어디를 읽고 무엇을 지킬지**만 안내한다.

## 이 저장소는 무엇인가

React + Vite + TypeScript + Tailwind 4 기반의 최소 제품 기반(Foundation)이다. 웹과 Capacitor를 함께 겨냥한다.
도메인 화면·인증·API 클라이언트·상태관리 라이브러리는 **기본 탑재하지 않는다.** 제품이 필요할 때 각자 고른다
(근거와 한계: `docs/golden-path/2026-11-assessment.md`, 비정본 분석 문서).

## 먼저 읽을 문서

| 순서 | 문서                                       | 언제                                          |
| ---- | ------------------------------------------ | --------------------------------------------- |
| 1    | `AGENTS.md`                                | PR 작성·검증 기록 규칙 (항상)                 |
| 2    | `docs/conventions/project-structure.md`    | 파일을 어디에 둘지 정할 때                    |
| 3    | `docs/conventions/app-conventions.md`      | 라우팅·인증 가드·API 호출·환경 변수를 다룰 때 |
| 4    | `docs/conventions/library-selection.md`    | 외부 라이브러리를 고르거나 확장할 때          |
| 5    | `docs/conventions/theme-runtime-design.md` | Light/Dark 테마를 다룰 때 (설계안, 미구현)    |
| 참고 | `docs/provenance.md`                       | 코드 출처 확인                                |

Design System(토큰·컴포넌트 정본)은 이 저장소가 아니라 [`ranikun-labs/design-system`](https://github.com/ranikun-labs/design-system)이 소유한다.
여기에 복제하지 않고 링크로만 참조한다.

## 반드시 지킬 것

- 라우트 경로 문자열은 `src/constants/routes.ts`에서만 정의한다. 컴포넌트에 하드코딩하지 않는다.
- 문서의 "규약"은 제품이 따를 기준이고, "선택지"는 제품이 고르는 항목이다. 둘을 구분해서 읽는다.
- 한 제품에서만 확인된 패턴은 일반 규칙처럼 쓰지 않는다. 출처 제품을 명시한다.
- 공통 UI 패키지(`@ranikun-labs/react-ui`)는 아직 없다. 그것에 의존하는 코드를 만들지 않는다.
- 새 런타임 의존성은 `docs/conventions/library-selection.md`의 순서를 거친 뒤에만 추가한다.
- 변경 후 `pnpm verify`(format/lint/typecheck/test/build/leakage)로 확인하고, 실행하지 않은 검증은 `NOT_RUN`으로 기록한다.

## 하지 말 것

- 도메인 로직·인증 상태기계·공통 API 클라이언트·상태관리 라이브러리를 이 저장소에 먼저 추가하지 않는다.
- 제품(Finance, Carelog)의 `dev` 브랜치를 통째로 가져오지 않는다.
- Secret, 개인정보, 내부 경로를 문서·코드·PR 본문에 쓰지 않는다.
