# Repause 디자인 가이드 (코드 기준 실측)

> 이 문서는 실제 배포된 홈페이지 코드(`app/home-content.tsx`, `components/site/*`, `app/globals.css`, `lib/editorial.ts`)를 직접 읽고 추출한 **현재 진짜 사용 중인** 디자인 시스템 기록입니다.
> 리포즈 관련 UI 작업(신규 페이지, 컴포넌트, 카피, 애니메이션) 전에 반드시 참고하세요. 새 패턴이 필요하면 이 문서에도 함께 반영합니다.
> 요약본은 `.cursor/rules/repause-rules.mdc`(항상 적용)에 있고, 이 문서가 상세 원본입니다.

---

## 1. 컨셉 한 줄 요약

**에디토리얼 프리미엄 독채 스테이** — 스테이폴리오의 정보 우선순위 + 럭셔리 부티크 호텔의 직선적 화면 문법. 화이트 배경과 잉크 블랙(#1a1a1a) 대비, 사진·여백·타이포 자체가 브랜드 경험. 카드/배지 남발 금지, 장식 최소화.

**금지 레퍼런스**: 토스/당근식 둥근 카드(rounded-xl+), 웰니스 앱, 감성 라이프스타일 쇼핑몰, AI 랜딩 템플릿, 보라 계열, 글로우/유리질 효과, 베이지 카드 반복.

---

## 2. 컬러

| 용도 | 값 | Tailwind |
|---|---|---|
| 브랜드 잉크(텍스트/강조 배경) | `#1a1a1a` | `text-brand`, `bg-brand`, `border-brand` (`--color-brand` 토큰) |
| 본문 서브 텍스트 | gray-500 (`#737373` 계열) | `text-gray-500` |
| 보조/캡션 텍스트 | gray-400 | `text-gray-400` |
| 더 옅은 캡션(날짜 등) | gray-300 | `text-gray-300` |
| 보더(기본) | gray-100 | `border-gray-100` |
| 보더(구분선, 진함) | gray-200 | `border-gray-200` |
| 배경(기본) | white | `bg-white` |
| 배경(섹션 구분용 옅은 회색) | `#f8f8f8` | `bg-[#f8f8f8]` |
| 다크 섹션 배경 | `#1a1a1a` | `bg-[#1a1a1a]` |
| 다크 섹션 위 서브텍스트 | white/60~70 | `text-white/65` |
| 다크 섹션 위 옅은 라인 | white/10~15 | `border-white/10` |

- 컬러는 항상 오프화이트/화이트 배경 + 잉크 블랙 강조 섹션의 반복. 중간톤 그레이 계열만 사용.
- **금지**: 베이지/웜 뉴트럴 배경·보더, 보라 계열, 그라데이션 배경(오버레이용 블랙 그라데이션은 허용).
- 이미지 위 텍스트는 항상 `bg-gradient-to-t from-black/55~75 via-black/10~20 to-transparent` 오버레이로 대비 확보.

## 3. 타이포그래피

- **본문 폰트**: Pretendard 단일 (`--font-sans`, CDN import). `letter-spacing: -0.02em`, `word-break: keep-all` 전역 적용.
- **포인트 폰트**: Noto Serif KR (`font-serif`, `--font-noto-serif`, next/font, weight 200/300/400만 로드). 히어로 타이틀, 섹션 제목(`h2`), 인용구(pull quote)에**만** 한정. 본문/캡션엔 사용 금지.
- **자간**: 제목류는 음수 tracking (`tracking-[-0.02em]` ~ `tracking-[-0.04em]`), eyebrow/label류는 양수 (`tracking-[0.1em]` ~ `tracking-[0.12em]`).
- **폰트 굵기**: 세리프 제목은 `font-extralight`/`font-light`만 사용(볼드 세리프 금지). 본문 강조는 `font-medium`/`font-semibold`.

### 유동 타입 스케일 (`app/globals.css` `@layer utilities`)

```css
.text-display   { font-size: clamp(3rem, 8.5vw, 7.5rem); }      /* 홈 히어로 H1 */
.text-pullquote  { font-size: clamp(1.4rem, 2.8vw, 2.2rem); }    /* 인용구 */
.text-section    { font-size: clamp(1.6rem, 3vw, 2.4rem); }      /* 섹션 H2 */
.text-eyebrow    { font-size: 12px; letter-spacing: 0.12em; }    /* PageHero 상단 라벨 */
.text-label      { font-size: 12px; letter-spacing: 0.12em; }    /* 섹션 내 소라벨(회색) */
```

- PageHero(서브페이지 상단) 제목: `text-[clamp(2.2rem,5vw,3.5rem)] font-extralight leading-tight tracking-[-0.04em]`
- 본문 문단: `text-[15px] leading-[1.8] text-gray-500` (다크 배경은 `text-white/65`)
- 이 유틸리티 클래스 밖의 임의 숫자(`text-[17px]` 등)도 카드 타이틀 등에서 종종 사용 — 완전히 고정된 스케일이 아니라 **레퍼토리**로 취급하되, 새 사이즈를 만들기보다 기존 값을 재사용.

## 4. 레이아웃 & 그리드

- 컨테이너 폭: `max-w-6xl`(기본, 대부분 섹션) / `max-w-4xl`(텍스트 중심, 인용구·본문) / `max-w-xl`(짧은 리드 문구).
- 좌우 패딩: `px-5` 기본, md 이상에서 컨테이너로 중앙 정렬.
- 섹션 상하 패딩: `py-20 md:py-28`(일반 섹션), `py-12 md:py-16`(가벼운 섹션, 소식 등), `py-16 md:py-20`(신뢰/인용 섹션).
- 섹션 구분: **보더 라인** 사용 (`border-t border-gray-100`), 그림자로 구획하지 않음.
- 그리드: 4분할이 기본 패턴(`md:grid-cols-4`), 아이템 사이는 `border-l`/`border-t`로 구분(gap 대신 보더로 리듬 형성하는 경우 많음). 예: "하루의 여정", "예약 과정" 섹션.
- 모바일: 가로 스크롤(`overflow-x-auto`)로 4분할 카드 처리, `md:` 이상에서 grid로 전환.

## 5. 조형(Shape) 규칙 — 가장 중요

- **`rounded-none`이 기본값.** 버튼, 카드, 배지, 모바일 메뉴, 입력창 등 거의 모든 요소가 직선 사각형.
- **예외**: 캘린더 날짜 선택 하이라이트 등 포인트성 원형만 `rounded-full` 허용.
- `rounded-xl`/`rounded-2xl`/`shadow-lg` 등 둥근 대형 라디우스는 **레거시 문서에만 남아있는 설명이며 실제로는 사용하지 않음** (아래 5-1 참고). 신규 작업 시 절대 사용하지 말 것.
- 위계는 그림자보다 **1px 보더 + 여백 + 오버레이**로 구성. `shadow-sm`/`shadow-lg` 남용 금지(모바일 메뉴 드롭다운 등 최소한의 곳에만 `shadow-xl` 사용 예).

### 5-1. 참고: 과거 설명과의 차이

`.cursor/rules/repause-rules.mdc`의 예전 문구("rounded-xl 카드", "CTA rounded-xl")는 2026-05-24 에디토리얼 리디자인 이전 기준이 남아있던 것으로, 실제 코드와 불일치합니다. 이 문서(및 갱신된 규칙 파일)가 최신 기준입니다.

## 6. 버튼 (`lib/editorial.ts`)

공용 버튼 클래스 4종, 항상 이 상수를 import해서 사용 (직접 클래스 나열 금지):

```ts
editorialBtnPrimary      // 다크 배경 위: 흰 채움 버튼 (hover 시 아웃라인으로 반전)
editorialBtnOutline      // 다크 배경 위: 아웃라인 버튼
editorialBtnDark         // 라이트 배경 위: 블랙 채움 버튼
editorialBtnDarkOutline  // 라이트 배경 위: 그레이 아웃라인 버튼
```

공통 스펙: `min-h-[44px]`, `rounded-none`, `border`, `px-7 py-3`, `text-[14px] font-medium tracking-wide`, `transition-all duration-300`, hover 시 배경↔텍스트 반전.

헤더 nav의 "예약하기" CTA, 모바일 메뉴 CTA는 동일 톤(`border-brand bg-brand text-white`, hover 반전)이지만 폰트 사이즈가 조금 다름(`text-[13px]~[14px] font-semibold`) — 새 버튼이 필요하면 이 4종에서 파생시키고 `lib/editorial.ts`에 추가.

## 7. 카드 & 리스트 아이템

- `StayCard` 예시: `rounded-none border border-gray-200 bg-white`, hover 시 `-translate-y-1 hover:border-brand` (그림자 대신 이동+보더색 변화로 반응).
- 배지: `rounded-none bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500`.
- 리스트(소식 등)는 카드가 아니라 `divide-y divide-gray-100` 구분선 리스트 + hover 시 화살표 이동(`group-hover:translate-x-1`).
- 정보 나열은 `dl`/`dt`/`dd` + 좌측 라벨 고정폭(`w-[7.5rem] shrink-0 text-gray-400`) 패턴(footer 사업자 정보) 재사용.

## 8. 모션 (`components/motion/index.tsx`)

이징 상수:
```ts
EASE_OUT_QUART = [0.25, 1, 0.5, 1]   // FadeIn, StaggerItem, ScaleIn
EASE_OUT_EXPO  = [0.16, 1, 0.3, 1]   // TextReveal, PageTransition, 헤더 트랜지션
```

컴포넌트와 용도:
- `FadeIn` — 기본 등장 애니메이션(opacity+방향 이동), `direction`/`distance`/`delay` prop. 섹션 대부분에 사용.
- `TextReveal` — 제목/인용구 전용 clip-path 마스크 reveal(위→아래 슬라이드). 헤드라인 급 텍스트에만.
- `StaggerContainer` + `StaggerItem` — 리스트/그리드 순차 등장(`staggerChildren`).
- `ScaleIn`, `Parallax`, `ParallaxImage`, `ParallaxLayers` — 이미지 섹션 전용.
- `PageTransition` — 라우트 전환 시 페이지 전체 fade+slide.
- 모든 컴포넌트는 `useReducedMotion()` 체크 후 애니메이션 없이 렌더 — 신규 애니메이션 컴포넌트도 이 패턴 필수 준수.
- 헤더/버튼 트랜지션은 `transition-all duration-300` 또는 `duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`.

## 9. 헤더 (`site-header.tsx`)

- `sticky top-0 z-50`, 홈 히어로 위에서는 투명(그라데이션 `from-black/50 via-black/15 to-transparent`), 스크롤(80px) 또는 메뉴 오픈 시 `bg-white/80 backdrop-blur-md border-b border-gray-100`으로 전환.
- 로고는 `mix-blend-multiply`(라이트) ↔ `brightness-0 invert mix-blend-screen`(오버레이 투명 모드) CSS 필터로 배경에 맞춰 자동 반전 — 로고 이미지를 이중으로 만들지 말고 이 필터 방식을 재사용.
- nav 활성 링크는 배경색이 아니라 하단 1px 밑줄(`absolute bottom-0.5 h-px bg-brand`)로 표시.
- 모바일 메뉴는 배경 오버레이(`bg-black/40 backdrop-blur-sm`) + 스크롤 락(`body.style.overflow = 'hidden'`).

## 10. 푸터 (`site-footer.tsx`)

- 사업자 정보(숙박 제공자 + 예약대행 운영사)는 `<details>` 등으로 접지 않고 **항상 노출**(카드사/PG 심사 요건).
- `dl`/`dt`/`dd` 그리드, 라벨 폭 고정(`w-[7.5rem]`), 전화번호만 `tel:` 링크.
- 모든 링크/버튼 `min-h-[44px]`(모바일) / `md:min-h-[32px]`(데스크톱) — sticky CTA 바와 겹치지 않게 `pb-24 md:pb-12`.

## 11. 모바일 규칙

- 터치 대상 **최소 44px** (버튼, 링크, 메뉴 항목, 배지 제외).
- `375px` 기준 우선 설계, `env(safe-area-inset-*)`로 노치/홈바 안전영역 처리(`pb-[calc(12px+env(safe-area-inset-bottom))]` 패턴).
- 예약/결제 페이지를 **제외**하고 하단 sticky CTA 바(`MobileCTABar`) 노출.
- 카카오 채널 버튼은 sticky CTA 바 유무에 따라 오프셋 동적 전환(`bottom-[calc(92px+...)]` ↔ `bottom-[calc(16px+...)]`).
- 4분할 그리드는 모바일에서 가로 스크롤 또는 2열로 축소, 세로 스택 시 `border-t`로 구분.
- `viewport`에 `maximumScale` 지정 금지 (접근성 핀치줌 보장).

## 12. UX 라이팅

- 해요체 기본, 문장은 짧고 차분하게. 과장형("최고", "압도적", "완벽한") 금지, 조용히 권유하는 문장.
- 감성 카피(브랜드 무드)와 예약/정책 카피(신뢰·명확성)는 역할을 분리 — 같은 섹션에서 섞지 않음.
- 행정 어휘("운영팀", "접수", "정산") 금지. 영어 uppercase eyebrow는 헤더 nav 제외 지양.
- CTA는 동사 1개: "예약하기", "공간 둘러보기", "제휴 · 대관 문의".

## 13. 접근성

- `focus-visible`에 `outline: 2px solid currentColor; outline-offset: 3px` 전역 적용 — 커스텀 인터랙티브 요소도 outline 유지.
- `prefers-reduced-motion: reduce` 시 전역적으로 모든 애니메이션/트랜지션 `0.01ms`로 강제 축소(`globals.css` 미디어쿼리) — 모션 컴포넌트도 `useReducedMotion()`으로 이중 대응.
- `onClick` 있는 날짜 셀/탭 등은 `<button>` + `aria-pressed`/`aria-label` 사용.

## 14. 새 UI를 만들 때 체크리스트

1. `rounded-none` 기본, 예외(원형 포인트)만 `rounded-full`.
2. 버튼은 `lib/editorial.ts`의 4종에서 파생.
3. 그림자 대신 보더+여백+오버레이로 위계 구성.
4. 제목은 `font-serif` + `font-extralight/light`, 본문은 Pretendard(`font-sans` 기본값이라 별도 지정 불필요).
5. 컬러는 `#1a1a1a` / gray-50~500 / white 조합 밖으로 나가지 않기.
6. 새 애니메이션은 `components/motion`의 기존 컴포넌트 재사용, 신규 제작 시 `useReducedMotion()` 필수.
7. 모바일 터치 44px, safe-area 처리, sticky CTA 바 오프셋 충돌 확인.
8. 카피는 해요체·과장 없이, CTA는 동사 1개.
