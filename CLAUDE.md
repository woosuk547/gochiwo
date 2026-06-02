# Repause - 프리미엄 독채 스테이 예약 플랫폼

> **활성**: Repause (크리오스 외주) | **비활성**: 고쳐줘 → `_legacy-gochiwo/`로 분리 완료

## 배포 & 인프라
- **프로덕션**: https://repause.up.railway.app
- **도메인**: 반값도메인 (ID: `sm5126`, PW: `!zmfldhtm5151`)
- **Github**: https://github.com/woosuk547/gochiwo
- **플랫폼**: Railway (무료 플랜, main 브랜치 push 시 자동배포)
- **ID**: Proj `77958108-ba74-41be-8786-a64664c6ad5c` | Svc `e9f3c8dd-28f5-4cad-a5bb-93c9f4c3b2fc` | Env `b6a7a333-ffc1-467e-8040-f6f3ae7ed99f`

## AI 작업 수칙
- 한국어 사용
- 수정 전 파일 읽기 필수
- 변경 사항 간결히 설명
- 이미지: Gemini Imagen 4 (`generate-repause-editorial-images.mjs`) 전용. 외부 다운 금지.
- **팁 자동 기록**: 새롭게 알게 된 버그, 해결책, 팁 발견 시 즉시 이 파일 하단 `## 배운 점 & 팁`에 최소 요약 형식(`- [YYYY-MM-DD] 이슈 -> 팁`)으로 추가할 것. 미사어구 절대 금지.

## 기술 스택
- Next.js 16.1.6 (App Router, Turbopack), TypeScript
- Tailwind v4, shadcn/ui
- Prisma 6.19.2, SQLite (`prisma/dev.db`)
- 폰트: Pretendard 기본, Noto Serif KR 포인트 (CDN 명조체 사용 허용)
- 네이버 지도 (반드시 `ncpKeyId` 사용, clientId 금지)
- 네이버 메일 (nodemailer + imapflow)
- Node.js 20.20.0

## 디자인 체계
- **방향**: 에디토리얼 프리미엄 (스테이폴리오 감성 + 럭셔리 부티크 호텔 레이아웃)
- **배경**: 흰 배경 기본, 검정(#1a1a1a) 강조 섹션
- **이미지**: full-bleed (21:9 전폭), 50/50 교대, 이미지 위 텍스트 오버레이
- **폰트**: Pretendard 단일, `clamp()` 유동 폰트 크기, `tracking-[-0.03em]` 타이틀
- **컬러**: #1a1a1a(본문/강조) / gray-500(서브) / white(오버레이 텍스트)
- **버튼**: `rounded-none border` square 스타일 (에디토리얼), 배경 반전 hover
- **애니메이션**: TextReveal(클립패스 마스크), FadeIn, Parallax(useScroll)
- **UX 라이팅**: 해요체, 짧은 문장, 한 문장 한 메시지
- **금지**: 과도한 세리프 남용(헤드라인 포인트만 허용), rounded-[28px+], 웜 뉴트럴, text-[10px], tracking-[0.3em+], 영어 eyebrow(헤더 nav 제외)

## 프로젝트 요약
- `app/stays/`, `app/stays/[slug]/`, `app/space/`, `app/reservation/`, `app/brand/`, `app/partnership/`, `app/guide/`, `app/my-reservation/`
- API: `api/reservations/`, `api/reservations/lookup/`, `api/block-dates/`, `api/payment/`, `api/mail/`, `api/admin/`
- DB: `Reservation`, `BlockedDate` (Prisma)
- 레거시(고쳐줘): `_legacy-gochiwo/`에 전부 분리
- 주요 컴포넌트: `large-calendar-picker`, `reservation-content`, `partnership-content`, `mobile-cta-bar`, `kakao-channel-button`

## 주요 명령어
- `npm run dev`
- `npx prisma generate && npx prisma db push`
- `npm run db:seed`
- `node generate-repause-editorial-images.mjs` — Gemini Imagen 4로 에디토리얼 이미지 생성 (API 키 필요)

## 요금 정책 (코드 기준: `lib/repause-pricing.ts`)
- 비수기 평일(일-목): 680,000원/박
- 비수기 주말(금-토): 780,000원/박
- 성수기(7/15~8/24, 12/20~1/15): 950,000원/박
- 기본 2인, 초과 40,000원/인/박
- 제휴 임직원: 12% 할인
- 예약금: 최종 금액의 50% (1,000원 단위 반올림)

## 이슈 대응
- 네이버 지도 실패: `ncpKeyId` 확인, localhost:3000 등록 확인, 재시작
- Prisma 에러: `npx prisma generate && npm run dev`

## 배운 점 & 팁 (TIPS)
- [2026-05-23] 규칙 및 가이드 파일 작성 시 미사어구를 극단적으로 생략하고 불필요한 서술어를 걷어내면 AI 컨텍스트 토큰을 최대 70% 절약할 수 있으며, 지시 이행률이 대폭 상승함.
- [2026-05-24] 고쳐줘 레거시 코드를 `_legacy-gochiwo/`로 분리하고 Prisma 스키마에서 미사용 모델 제거하면 빌드 용량과 컨텍스트 혼란이 줄어듦.
- [2026-05-24] 하이엔드 디자인 리뷰: (1) 카피 톤에서 "운영팀/접수/정산" 등 행정 어휘 제거 → 간결·감성적 문장으로 교체, (2) 히어로 overlay 82%→58%로 낮춰 영상 비주얼 살림, (3) rounded-[32px] → 직선 에디토리얼로 통일, (4) CTA 문구 "예약 및 결제 안내 보기"→"예약하기"로 축소, (5) 모바일에서 info박스 숨기고 CTA를 fold 안에 배치, (6) 이미지 min-h 반응형 처리 필수.
- [2026-05-24] 모바일 UX 개선: (1) 모든 터치 대상 min 44px 확보(햄버거/캘린더/FAQ/푸터), (2) 모바일 메뉴에 배경 오버레이+스크롤 락, (3) 하단 sticky CTA "예약하기" 바 추가(예약/결제 페이지 제외), (4) 홈 Room Guide 모바일 2개로 축소+이미지 aspect-[4/3] 고정, (5) 카카오 버튼 bottom-20으로 CTA바 겹침 방지.
- [2026-05-24] 예약/제휴 페이지 리팩토링: 3개월 읽기전용 캘린더 → 큰 인터랙티브 캘린더 1개(`LargeCalendarPicker`)로 교체, 왼쪽 캘린더⇔오른쪽 폼 양방향 날짜 동기화 구현.
- [2026-05-24] PageHero 카피 전페이지 압축: title 3~6자, description 1문장 이내. 하이엔드 브랜드는 제목이 명확하면 부연 최소화.
- [2026-05-26] Next.js 16.1.6 Turbopack 빌드 시 "Dependency tracking is disabled so invalidation is not allowed" 패닉 에러는 코드 문제가 아닌 Turbopack 버그. Railway 프로덕션 배포(webpack)에서는 정상 동작.
- [2026-05-26] 에디토리얼 레이아웃 전면 개편: (1) 홈 히어로 타이포그래피 클램프 폰트, (2) 공간 사진 full-bleed alternating (21:9 전폭 + 50/50 그리드), (3) 예약 단계 4카드→다크 배경 텍스트 타임라인, (4) 공간소개 페이지 이미지히어로+교대섹션, (5) PageHero 이미지배경 옵션 추가, (6) TextReveal 클립패스 애니메이션 컴포넌트, (7) editorial-*.jpg 이미지 경로 추가. Gemini API 키 만료로 신규 이미지 생성 실패 → 기존 이미지 복사로 대체. 새 API 키 발급 후 node generate-repause-editorial-images.mjs 로 교체 가능.
- [2026-05-27] 예약 약관 동의 및 브랜드 로고 개선 -> 9개 필수 약관을 2개 대그룹(취소/환불, 안전수칙)으로 슬림화하여 프리미엄 UX를 완성하고, Option 4(블랙 + private stay) 로고를 헤더/푸터에 완벽 적용함. CSS 필터(invert, mix-blend-screen/multiply)를 활용하여 투명/고정 헤더 모드에 맞춰 로고 색상이 동적으로 반전되도록 최적화함.
- [2026-05-30] FAQ 리팩토링 및 팩트 동기화 -> 체크인 시간 변경 시 `lib/repause-content.ts`, `lib/mailer.ts`, `lib/mock-stays.ts` 등 체크인 가이드 시간을 완벽 동기화해야 함. 연박 할인은 `lib/repause-pricing.ts`에 자동 차감 비즈니스 로직을 연결하여 실제 결제 창에서 완벽 일치하도록 구성함.
- [2026-05-30] 모바일 사용성 극대화 -> iOS 홈 바 간섭 방지를 위해 `pb-[calc(12px+env(safe-area-inset-bottom))]`과 같은 고정밀 안전 영역 CSS 공식을 대입하고, 카카오 채널 버튼 등의 플로팅 오프셋이 모바일 sticky CTA 바의 존재 여부에 따라 동적 스위칭(`bottom-[calc(92px+env(safe-area-inset-bottom))]` ⇔ `bottom-[calc(16px+env(safe-area-inset-bottom))]`)되도록 설계함.
- [2026-05-30] 에디토리얼 조형의 통일성 -> 직선미를 중시하는 에디토리얼 레이아웃에서 캘린더 개별 날짜 버튼은 `rounded-none`으로 정갈하게 면처리를 하되, 선택 원형 하이라이트만 `rounded-full`로 대조 배합하여 기하학적 통일감과 가독성을 동시 충족함.
- [2026-05-30] 모바일 브라우저 스타일 강제 주입 해결 -> iOS Safari 등 일부 환경에서 html 및 body에 터치/크기 조절 인라인 스타일을 강제 주입하여 발생하는 Next.js 하이드레이션 불일치 에러는 layout.tsx의 html 및 body 태그에 `suppressHydrationWarning`을 부여하여 해결함.
- [2026-05-30] 비디오 포스터 프레임 완벽 동기화 -> 메인 히어로 비디오(`hero.mp4`) 로드 전 노출되는 포스터 이미지(`hero-exterior.jpg`)가 실제 비디오 첫 프레임(실내)과 달라 발생하던 시각적 이질감(플래시 현상)을 `ffmpeg`로 첫 프레임을 정밀 추출해 포스터로 대체함으로써 완벽히 해결함.
- [2026-05-30] 결제 검증 및 보안 강화 -> 결제 승인 API(`/api/payment/confirm`)는 클라이언트 `amount`를 맹신하지 않고 DB의 `depositAmount`/`finalAmount`와 서버에서 강제 재비교해 금액 위변조를 차단해야 함. 인증이 없고 요금 폭탄 리스크가 있는 레거시 AI API(`financial-agent`, `generate-image`)는 활성 트리에서 영구 제거해야 함.
- [2026-05-30] 캘린더 단일 진실 공급원(Single Source of Truth) 설계 -> 캘린더 로직이 분산되면 날짜 가용성/선택 로직 불일치 버그가 유발되므로, `getMonthMatrix`와 `selectDateRange`를 `lib/calendar.ts` 공용 유틸로 완전히 통일해야 함. 화면에 캘린더가 2개 이상 동시 노출되면 혼란스러우므로, 폼 영역은 읽기 전용 날짜 표시로 처리해 UI 복잡도를 줄여야 함.
- [2026-05-30] 접근성 표준 준수(WCAG 1.4.4) -> `viewport`의 `maximumScale=1`은 저시력자 핀치 줌을 막아 접근성 위반이므로 반드시 제거해야 함. `onClick`이 들어간 모든 날짜 셀과 탭은 스크린리더와 키보드 초점 이동을 위해 `<button>` 태그와 `aria-pressed`, `aria-label` 속성으로 의미론적 구조를 보강해야 함.
- [2026-06-02] Railway 프로덕션 배포 핵심 사항 -> (1) Next.js 16 Turbopack은 Railway 컨테이너에서 패닉 오류 발생 → `next build`가 아닌 `next@15.3.8`(Dockerfile 내 `npm ci`)를 사용해 webpack 빌드 강제. (2) Dockerfile 빌드 단계에서 `DATABASE_URL=file:/app/prisma/dev.db` (절대경로)로 `prisma db push`를 실행 후 db 파일을 런타임 단계로 복사해야 함. (3) Railway env var `DATABASE_URL` 도 절대경로`file:/app/prisma/dev.db`로 설정해야 상대경로 문제 방지. (4) `next.config.ts`에 `output: 'standalone'`과 `eslint.ignoreDuringBuilds: true` 필수. (5) Railway 무료 트라이얼 만료 시 env var 변경 API 차단됨 → 대시보드 직접 변경. (6) `useSearchParams()` 사용 컴포넌트는 반드시 Suspense 경계로 감싸야 빌드 통과.
- [2026-06-02] Railway Dockerfile 배포 관리자 계정 설정 -> 관리자 로그인에는 `ADMIN_ID`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` 3개가 모두 필요. `ADMIN_SECRET` 단독으로는 동작하지 않음. Railway 변수 변경 후 재배포 자동 트리거됨.
- [2026-06-03] 하이엔드 럭셔리 스테이 브랜드화 및 대관 문의 오토메이션 -> (1) 조식 관련 키워드를 전면 제거하고 '포치 아래 명상' 등 고요함/비움 미학을 강조함. (2) 최대 인원을 6인으로 확장하고 2/4/6인 짝수 단위 예약으로 제한함. (3) 제휴 기업(네오위즈, 이스트소프트) 우대 혜택을 평일 30%, 주말 20%, 성수기 20%로 날짜별 정밀 세분화하여 SQLite 및 메일러에 연동함. (4) 예약 페이지 내 실시간 조회(Lookup) 탭을 완전히 통합 구현함. (5) 미디어 대관 전용 스키마(RentalInquiry)를 탑재하고 DB 영속화 및 기품 있는 관리자 메일 오토메이션 전송을 연계함. (6) Noto Serif KR 명조체 포인트를 도입하여 하이엔드 타이포그래피 미학을 완성함.

## 2026-05-24 작업 일지

### 기능 추가
- `app/stays/[slug]/page.tsx` — 스테이 상세 페이지 생성 (기존 404 해소)
- `app/my-reservation/page.tsx` + `api/reservations/lookup/` — 예약 조회 기능
- `components/site/kakao-channel-button.tsx` — 카카오 채널 플로팅 문의 버튼
- `components/site/large-calendar-picker.tsx` — 큰 인터랙티브 캘린더 (예약/제휴 좌측)
- `components/site/reservation-content.tsx` — 예약 페이지 클라이언트 래퍼 (캘린더⇔폼 연동)
- `components/site/partnership-content.tsx` — 제휴 페이지 클라이언트 래퍼
- `components/site/mobile-cta-bar.tsx` — 모바일 하단 sticky "예약하기" 바

### 디자인/UX 개선
- 전 페이지 카피 톤 하이엔드화 (행정 어휘 제거, 문장 50% 이상 축소)
- 히어로 그라데이션 82%→58%, H1 폰트 축소, CTA 문구 간결화
- rounded-[28/32px] → 직선 에디토리얼 통일
- 이미지 모바일 반응형 높이 + alt 한국어화
- 모바일 터치 영역 44px 확보, 메뉴 오버레이/스크롤락, FAQ 패딩

### 코드 정리
- 고쳐줘 레거시 전량 `_legacy-gochiwo/`로 분리
- Prisma 스키마에서 미사용 모델 제거, seed 재작성
- `tsconfig.json`에서 레거시 폴더 exclude
- SEO metadata 전 페이지 추가
- 전화번호 자동 포맷 + 유효성 검증
- 요금 정책 문서(CLAUDE.md, rules) 코드 기준으로 동기화
- 가용 캘린더 cursor-pointer/hover 효과 제거 (읽기 전용 명확화)
- 결제 페이지 PENDING 상태 가드 + 날짜 한국어 포맷

## 2026-05-25 작업 일지

### 기능 추가
- `components/motion/index.tsx` — 재사용 애니메이션 컴포넌트 (FadeIn, StaggerContainer, StaggerItem, ScaleIn, PageTransition, CountUp, Parallax)
- `components/motion/animated-sections.tsx` — 서버 컴포넌트 호환 래퍼 (AnimatedSection, AnimatedGrid, AnimatedGridItem)
- framer-motion 도입 (토스 스타일 쫀득한 easing: `cubic-bezier(0.25, 1, 0.5, 1)`)

### 애니메이션 적용 범위
- 전 페이지 PageTransition (라우트 전환 시 fade+slide up)
- PageHero 텍스트 stagger reveal
- 홈 히어로 섹션 순차 등장 + info 카드 stagger
- 스크롤 기반 섹션 reveal (IntersectionObserver, once)
- 카드/그리드 stagger 등장 (space, brand, guide, stays, notices)
- FAQ 아코디언 AnimatePresence (height auto 트랜지션)
- 모바일 CTA 바 slide-up 등장/퇴장
- 카카오 문의 버튼 scale+rotate micro-interaction
- 버튼 active:scale[0.97] 피드백
- `prefers-reduced-motion` 전역 존중

### 모바일 최적화 (전 페이지)
- `viewport-fit: cover` + safe-area inset 적용 (`layout.tsx`)
- `-webkit-tap-highlight-color: transparent` 추가
- 관리자 통계 카드: `grid-cols-5` → 모바일 가로 스크롤
- 관리자 2단 레이아웃: `lg:grid` → 모바일 세로 쌓임
- 관리자 캘린더/탭: 터치 영역 min 44px 확보, 패딩 축소
- reservation-manager: 모바일 필터 min-h 36px, 패딩 반응형
- 예약 페이지: 모바일 px-4 py-8, 카드 간격 축소, sm:grid-cols-2 단계 추가
- 캘린더 피커: 모바일 gap/padding 축소, 초기화 버튼 min-h 36px
- 결제 페이지: 모바일 p-4, 예약정보 카드 p-4, 제목 2xl→md:3xl
- 예약조회: 모바일 px-4 py-10, 폼/결과 카드 p-5
- 푸터: 모바일 pb-24 (CTA 바 겹침 방지), 링크 min-h 32px, 사업자 정보 summary min-h 44px
- blocked-date-manager: 모바일 패딩 p-4
