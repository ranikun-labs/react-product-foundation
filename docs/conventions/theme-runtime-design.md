# 공통 Theme 런타임 설계안

> **설계 문서이며 구현이 아니다.** RPF에는 Theme 코드가 없고 이 PR도 코드를 추가하지 않는다.
> 패키지 위치·이름은 **S1(공통 UI 패키지 소비 실증) 이후 결정**한다. 그 전에는 이 설계를 RPF에 복사 구현하지 않는다.

## 1. 근거: 두 제품 `src/theme/` 비교 (2026-11 시점)

| 항목                     | Finance                                                                      | Carelog                                                            |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 구성                     | 모듈 레벨 외부 스토어 + `useSyncExternalStore`, Provider 없음                | `ThemeProvider` Context + `useState`, Provider 밖 훅 사용 시 throw |
| 선택값                   | `system` / `light` / `dark`                                                  | 동일                                                               |
| 저장                     | `localStorage`, 키 `<제품 접두>:theme` 형태                                  | `localStorage`, 키 `carelog.theme`                                 |
| `system` 저장            | 키 삭제(=미선택과 동일)                                                      | 키에 `system` 기록                                                 |
| 미선택 읽기              | `null`                                                                       | `'system'`                                                         |
| 저장 결과                | 성공 여부(boolean) 반환                                                      | 반환 없음, 실패 무시                                               |
| DOM 반영                 | `.dark` 클래스 + `color-scheme` + `theme-color` meta (+ `color-scheme` meta) | `.dark` 클래스 + `color-scheme` + `theme-color` meta               |
| 색 상수                  | light `#f2f4f6` / dark `#0f1114`                                             | 동일                                                               |
| 깜빡임 방지              | `index.html` 인라인 스크립트가 같은 규칙 복제, 테스트가 대조                 | 동일 방식                                                          |
| 시스템 변경·탭 간 동기화 | 지원                                                                         | 지원                                                               |

차이는 대부분 구현 선택이고, **규칙(3상태, `.dark` 클래스, 색 상수, 인라인 스크립트)은 같다.** 저장 키만 제품별로 다르다.

## 2. 설계 (제안)

### 공개 형태

```ts
// 의사 코드 — 구현 아님
createThemeStore({
  storageKey: string,                      // 필수. 제품이 주입한다
  colors?: { light: string; dark: string } // theme-color meta 값. 기본값은 디자인 시스템 토큰과 일치
}) => {
  getPreference(): 'system' | 'light' | 'dark'
  getResolved(): 'light' | 'dark'
  setPreference(p): { persisted: boolean }  // 저장 실패를 호출자가 알 수 있다
  subscribe(listener): () => void
  getServerSnapshot(): ...                  // prerender용 고정 스냅샷('system' → 'light')
}
useTheme(store)  // useSyncExternalStore 기반. Provider 불필요
```

### 결정과 트레이드오프

- **외부 스토어 방식을 기반으로 한다**(Finance형). 이유: prerender(SSR) 서버 스냅샷을 Provider 없이 안전하게 다루고 저장 실패를 인지할 수 있다. 버리는 것: Carelog의 Provider 구조. 필요한 제품은 얇은 `ThemeProvider` 래퍼를 직접 만든다.
- **저장 키는 주입한다.** 키가 바뀌면 기존 사용자의 선택이 초기화되므로, 두 제품은 현재 키를 그대로 넘겨 전환한다.
- **`system` 저장은 "키 삭제"로 통일**을 제안한다(미선택과 동일 의미). 단, 현재 Carelog가 `system`을 기록하므로 전환 시 읽기 호환(`system` 문자열도 허용)을 유지한다.
- **`index.html` 인라인 스크립트는 패키지로 만들지 않는다.** RPF 템플릿에 두고, 스크립트와 런타임의 키·색·규칙이 같은지 **대조 테스트**를 템플릿에 포함한다. 스크립트 생성기·Vite 플러그인은 만들지 않는다.
- Brand·Density 런타임 전환은 범위 밖이다(두 제품 차이가 토큰 값이고 전환 요구가 없다).
- 토큰 값(`--page` 등)의 정본은 [`ranikun-labs/design-system`](https://github.com/ranikun-labs/design-system)이다. `theme-color` 상수는 그 토큰과 일치해야 하며, 일치 검증 방식은 정본 확인 후 정한다.

### 실패모드

| 위험                                        | 대응                                               |
| ------------------------------------------- | -------------------------------------------------- |
| 저장 키 불일치로 사용자 선택 초기화         | 키 주입 + 전환 PR에서 기존 키 사용을 테스트로 고정 |
| 인라인 스크립트와 런타임 규칙 어긋남        | 대조 테스트 필수                                   |
| 저장소 접근 불가(프라이빗 모드·quota)       | try/catch, 화면은 바뀌고 `persisted: false` 반환   |
| 패키지 업데이트가 제품별로 다른 시점에 반영 | 버전 고정, 제품 전환 PR을 같은 릴리즈로 묶는다     |
| SSR/prerender에서 `window` 접근             | 서버 스냅샷 고정, 접근은 가드                      |

## 3. 순서 (제안, 미결정 포함)

1. S1 완료 후 패키지 위치 결정(공통 UI 패키지 내부 vs 별도 패키지) — **미결정**.
2. 스토어와 기준 테스트(두 제품 테스트 합본) 작성.
3. RPF 템플릿에 `index.html` 스니펫과 대조 테스트 추가.
4. 제품이 각자 `src/theme/`를 패키지 호출로 교체(기존 저장 키 전달).
5. RPF가 같은 패키지를 소비.

각 단계는 별도 PR로 나눈다. 이 문서는 Owner 결정 전까지 표준이 아니다.
