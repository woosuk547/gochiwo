# 고쳐줘 - 집수리 중개 플랫폼

한국 집수리(설비) 중개 플랫폼. 고객 요청 → 관리자가 업체 매칭.

## 🤖 AI 작업 지침

### 기본 원칙
- **항상 한국어로 대답**
- 모르는 것은 웹 검색 먼저 실행
- 코드 수정 전 파일 먼저 읽기
- 변경 사항 명확히 설명

### 이미지 관리
- **Gemini Imagen 4만 사용** (AI 이미지 생성)
- 스크립트: `generate-korean-images.mjs`
- 무료 이미지 다운로드 금지
- 한국 스타일 프롬프트 사용

---

## 기술 스택

- Next.js 16.1.6 (App Router, Turbopack), TypeScript
- Tailwind CSS v4, shadcn/ui
- Prisma 6.19.2, SQLite
- 네이버 지도 API (ncpKeyId 파라미터)
- Gemini Imagen 4 (이미지 생성)
- Node.js 20.20.0

## 프로젝트 구조

```
app/
├── page.tsx                 # 메인 (Client)
├── request/page.tsx         # 요청 폼 (지도+사진)
├── admin/page.tsx           # 관리자 대시보드
└── api/
    ├── requests/route.ts    # POST/GET
    └── contractors/route.ts # GET

prisma/
├── schema.prisma            # CustomerRequest, Contractor
├── seed.ts                  # 시드 데이터
└── dev.db                   # SQLite
```

## 환경 변수 (.env)

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID="your_naver_client_id"
NAVER_MAP_CLIENT_SECRET="your_naver_client_secret"
GEMINI_API_KEY="your_gemini_api_key"
```

## 주요 명령어

```bash
# 개발 서버
npm run dev

# Prisma
npx prisma generate
npx prisma db push
npm run db:seed
npx prisma studio

# 이미지 생성 (Gemini)
node generate-korean-images.mjs
```

## 네이버 지도 API

**중요**: `ncpKeyId` 파라미터 사용 (ncpClientId 아님)

```tsx
// app/layout.tsx
<Script src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`} />
```

도메인 등록: http://localhost:3000

## Gemini 이미지 생성

```bash
# 한국 스타일 이미지 생성
node generate-korean-images.mjs
```

**생성 이미지:**
- public/hero-image.jpg
- public/cases/bathroom-after.jpg
- public/cases/kitchen-after.jpg
- public/services/boiler.jpg

**프롬프트 예시:**
```
A friendly Korean home repair professional in blue work uniform,
smiling warmly, holding tools, standing in a clean modern Korean apartment
```

## 알려진 이슈

### 네이버 지도 인증 실패
- `ncpKeyId` 파라미터 확인
- 도메인 등록 확인
- 서버 재시작

### Prisma Client 에러
```bash
npx prisma generate
npm run dev
```

## 현재 상태

- ✅ 네이버 지도 연동
- ✅ 사진 첨부 (Base64)
- ✅ Haversine 거리 계산
- ✅ 홈코(homeco.kr) 스타일 UI 적용
- ✅ Gemini 이미지 생성 (고품질 프롬프트)
- ✅ 파비콘 (app/icon.png)
- ✅ 즉시 적용 개선사항 (2026-03-08)
  - 견적 계산기 (/estimate)
  - 전문가 완료 건수 표시
  - 긴급 요청 옵션
  - 리뷰 인센티브 배너
  - 진행 상황 추적 바

## 신규 기능 (2026-03-08)

### 견적 계산기 (/estimate)
- 3단계 간편 견적: 카테고리 → 긴급도 → 면적
- 실시간 예상 금액 계산 (공임비 + 자재비 분리)
- 긴급 요청 시 +30% 할증 자동 계산
- 무료 현장 점검 신청 CTA

### 신뢰도 강화 요소
- 전문가 완료 건수 표시 ("이달 15건 완료")
- 리뷰 인센티브 배너 (스타벅스 쿠폰)
- 진행 상황 추적 바 (신청 → 매칭 → 연락)

### 이미지 품질 개선
- 2026 베스트 프랙티스 적용
- 주제 + 액션 + 배경 + 카메라 + 조명 + 품질
- photorealistic, 8K, 85mm lens, natural lighting
- 한국 스타일 강조 (Korean apartment, Seoul)

## UI/UX 특징 (홈코 스타일)

### 한국 사용자 맞춤
- 이모지 활용 (💡🛠️✨😊💧🔥 등)
- 존댓말 + 친근한 톤 혼용
- "와!", "대박!" 등 감탄사 사용
- 공감형 카피 ("이런 문제로 고민이세요? 😥")

### 투명한 가격 표시
- 공임비 + 자재비 분리 표시
- "표준 가격제" 강조
- 숨은 비용 없음 명시

### 신뢰 요소
- 헤더에 전화번호 (1577-1234)
- "무료 현장 점검" 강조
- 고객 후기 직접 인용형
- 시공 전/후 스토리텔링

### 모바일 최적화
- 하단 고정 버튼 (전화 상담 + 무료 점검)
- 클릭 가능한 전화번호 (tel:)
- 반응형 레이아웃

서버: http://localhost:3000
