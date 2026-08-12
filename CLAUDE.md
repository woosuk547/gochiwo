# Repause - 프리미엄 독채 스테이 예약 플랫폼

> **활성**: Repause (크리오스 외주) | **비활성**: 고쳐줘 → `_legacy-gochiwo/`로 분리 완료

## 배포 & 인프라
- **프로덕션**: https://repause.co.kr (NCP)
- **도메인**: 반값도메인 (ID: `sm5126`, PW: `!zmfldhtm5151`) | Cloudflare NS → A `101.79.25.108`
- **NCP (네이버클라우드)**: ID `creaos@naver.com` / PW `!zmfldhtm160!` / 연락처 `010-2648-6729`
- **서버**: `repause` (Instance `142994067`) | Public IP `101.79.25.108` | SSH `root` + `deploy/ncp/repause-key.pem`
- **앱 경로**: `/opt/repause` (docker compose + `.env.production`) | Volume `/data` → `DATABASE_URL=file:/data/dev.db`
- **배포**: `NCP_HOST=101.79.25.108 SSH_OPTS="-i deploy/ncp/repause-key.pem" npm run deploy:ncp`
- **Github**: https://github.com/woosuk547/gochiwo
- **레거시 Railway** (비활성·트라이얼 만료 임박): `repause-production.up.railway.app` | Proj `c3ce71f7-fe3d-4c63-b714-4e56a2892dc7`

## AI 작업 수칙
- 한국어 사용
- 수정 전 파일 읽기 필수
- 변경 사항 간결히 설명
- **프로덕션 자동 배포**: 작업 완료 시 사용자 확인 없이 `git add . && git commit && git push origin main` 실행. 앱/인프라 변경 시 `npm run deploy:ncp`로 NCP 반영. "배포할까요?" 등 질문 금지.
- 이미지: Gemini Imagen 4 (`generate-repause-editorial-images.mjs`) 전용. 외부 다운 금지.
- **팁 자동 기록**: `.cursor/rules/tips.mdc`에만 기록 (`CLAUDE.md` 금지). 형식 `- [YYYY-MM-DD] 이슈 -> 팁`. Cursor 훅(`.cursor/hooks.json`)이 sessionStart/stop에서 미기록을 점검한다.

## 기술 스택
- Next.js 16.1.6 (App Router, Turbopack), TypeScript
- Tailwind v4, shadcn/ui
- Prisma 6.19.2, SQLite (`prisma/dev.db`)
- 폰트: Pretendard 기본, Noto Serif KR 포인트 (CDN 명조체 사용 허용)
- 네이버 지도 (반드시 `ncpKeyId` 사용, clientId 금지)
- 네이버 메일 (nodemailer + imapflow)
- Node.js 20.20.0

## 디자인 체계
> 상세 원본(컴포넌트별 실측 클래스, 체크리스트): `docs/design-guide.md`. UI 작업 전 필수 확인.
- **방향**: 에디토리얼 프리미엄 (스테이폴리오 감성 + 럭셔리 부티크 호텔 레이아웃)
- **배경**: 흰 배경 기본, 검정(#1a1a1a) 강조 섹션
- **이미지**: full-bleed (21:9 전폭), 50/50 교대, 이미지 위 텍스트 오버레이
- **폰트**: Pretendard 기본, Noto Serif KR 포인트(히어로/인용구/브랜드 헤드카피 한정), `clamp()` 유동 폰트 크기, `tracking-[-0.03em]` 타이틀
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
- 성수기(7/15~8/24, 12/1~1/15): 950,000원/박
- 기준 4인 · 최대 6인 (예약 선택 2·4·6인). 초과 시 40,000원/인/박
- 제휴 임직원: 평일 30%, 주말·공휴일 20%, 성수기 20% 할인
- 예약금: 최종 금액의 50% (1,000원 단위 반올림)

## 이슈 대응
- 네이버 지도 실패: `ncpKeyId` 확인, localhost:3000 등록 확인, 재시작
- Prisma 에러: `npx prisma generate && npm run dev`

## 배운 점 & 팁
- 이전됨: `.cursor/rules/tips.mdc` (Cursor 규칙). 이 파일에 팁 추가 금지.

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
