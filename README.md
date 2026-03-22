# FixMatch - 집수리 중개 플랫폼 MVP

한국의 집수리(설비) 중개 플랫폼 MVP 프로젝트입니다.

## ✅ 프로젝트 상태

**🎉 V2 개발 완료! (네이버 지도 + 위치 기반 매칭)**

- ✅ Next.js 14 + TypeScript + Tailwind CSS 설정
- ✅ shadcn/ui 컴포넌트 라이브러리
- ✅ Prisma + SQLite 데이터베이스
- ✅ **네이버 지도 API 연동 (Web Dynamic Map, Geocoding)**
- ✅ **사진 첨부 기능 (Base64 저장)**
- ✅ **위치 기반 업체 거리순 추천 (Haversine 공식)**
- ✅ 시드 데이터 삽입 (업체 3개 + 실제 위경도, 샘플 요청 2개)
- ✅ API 라우트 구현 완료
- ✅ Node 20.20.0 환경 설정 완료

## 🚀 기술 스택

- **Frontend & Backend**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: Prisma 6.19.2, SQLite
- **Maps**: 네이버 지도 API (Web Dynamic Map, Geocoding)
- **Runtime**: Node.js 20.20.0

## 🆕 새로운 기능 (V2)

### 1. 네이버 지도 통합
- 고객 요청 시 지도에서 위치 직접 선택
- Reverse Geocoding으로 주소 자동 변환
- 관리자 대시보드에서 고객 위치 지도 표시

### 2. 사진 첨부
- 이미지 업로드 기능 (5MB 제한)
- Base64 인코딩으로 DB 저장
- 관리자 대시보드에서 사진 확인

### 3. 거리 기반 업체 추천
- Haversine 공식 사용
- 고객 위치 기준 가까운 업체 순으로 자동 정렬
- "약 X km" 거리 표시

## 📋 구현된 기능

### 1. 메인 랜딩 페이지 (/)
- 히어로 섹션 with CTA
- 서비스 특징 카드 (빠른 매칭, 검증된 업체, 안심 서비스)
- 관리자 페이지 링크

### 2. 고객 요청 폼 (/request)
- **🗺️ 네이버 지도에서 위치 선택** (클릭으로 마커 생성)
- **📍 Reverse Geocoding으로 주소 자동 입력**
- **📷 사진 첨부** (최대 5MB, JPG/PNG)
- 수리 종류 입력
- 상세 설명 (textarea)
- 폼 유효성 검사
- API 연동 (POST /api/requests)

### 3. 관리자 대시보드 (/admin)
- 통계 카드 (전체 요청, 대기중, 매칭완료, 등록 업체)
- 고객 요청 목록 테이블
- **요청 클릭 시 상세 정보 표시**:
  - 첨부 사진 확인
  - 네이버 지도에서 위치 확인
  - **거리 기반 가까운 업체 순위** (Haversine 공식)
- 상태 변경 기능 (PENDING → MATCHED → COMPLETED)
- 등록 업체 목록 (평점 포함)

## 🎯 바로 시작하기

### 환경 변수 설정

`.env` 파일에 네이버 지도 API 키가 이미 설정되어 있습니다:

```env
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID="g4hzpxrvaa"
NAVER_MAP_CLIENT_SECRET="e9Hj9COdeMSJKA7cE0DVPZUsRf19MXSWyxhoctwD"
```

### 서버 시작

```bash
# 1. nvm 활성화 (터미널을 새로 열었다면)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Node 20 사용
nvm use 20

# 3. 개발 서버 실행
npm run dev
```

서버가 시작되면 http://localhost:3000 을 브라우저에서 열어주세요.

### 테스트 시나리오

1. **메인 페이지** (http://localhost:3000)
   - "지금 바로 수리 요청하기" 클릭

2. **고객 요청** (http://localhost:3000/request)
   - 지도를 클릭해서 위치 선택 (마커가 생성되고 주소 자동 입력됨)
   - 수리 종류, 설명 입력
   - 사진 첨부 (선택사항)
   - 제출

3. **관리자 대시보드** (http://localhost:3000/admin)
   - 요청 목록에서 방금 생성한 요청 클릭
   - 왼쪽: 상세 정보 + 사진 확인
   - 오른쪽: 네이버 지도에서 위치 확인
   - 아래: 가까운 업체 순위 (거리순 정렬)

## 📁 프로젝트 구조

```
우석/
├── app/
│   ├── page.tsx                 # ✅ 메인 랜딩 페이지
│   ├── layout.tsx              # ✅ 네이버 지도 스크립트 로드
│   ├── request/
│   │   └── page.tsx            # ✅ 고객 요청 폼 (지도 + 이미지)
│   ├── admin/
│   │   └── page.tsx            # ✅ 관리자 (거리순 정렬)
│   └── api/
│       ├── requests/
│       │   ├── route.ts        # ✅ POST, GET (위경도, 이미지 처리)
│       │   └── [id]/route.ts   # ✅ PATCH
│       └── contractors/
│           └── route.ts        # ✅ GET
├── components/ui/              # shadcn/ui 컴포넌트
├── lib/
│   ├── prisma.ts              # ✅ Prisma 클라이언트
│   ├── distance.ts            # ✅ Haversine 공식
│   └── generated/prisma/      # Prisma 생성 파일
├── prisma/
│   ├── schema.prisma          # ✅ 위경도, imageUrl 필드 추가
│   ├── seed.ts                # ✅ 실제 서울 위경도 포함
│   └── dev.db                 # SQLite DB
├── .env                       # ✅ 네이버 지도 API 키
├── package.json
└── README.md
```

## 🗄️ 데이터베이스 스키마

### CustomerRequest (고객 요청)
- `id`: String (CUID)
- `title`: String - 수리 종류
- `description`: String - 상세 설명
- `address`: String? - 주소
- **`imageUrl`: String? - 첨부 사진 (Base64)**
- **`latitude`: Float? - 위도**
- **`longitude`: Float? - 경도**
- `status`: String - 상태 (PENDING, MATCHED, COMPLETED)
- `createdAt`: DateTime - 생성일

### Contractor (설비 업체)
- `id`: String (CUID)
- `name`: String - 업체명
- `phone`: String - 연락처
- `serviceArea`: String - 서비스 지역
- **`latitude`: Float - 위도**
- **`longitude`: Float - 경도**
- `rating`: Float - 평점 (0.0-5.0)
- `createdAt`: DateTime - 등록일

## 🗺️ 시드 데이터 (실제 위경도)

**업체 3개:**
1. 강남 누수 전문 (37.4979, 127.0276) - 강남역
2. 서울 배관 마스터 (37.4837, 127.0324) - 서초구청
3. 24시 긴급 설비 (37.5219, 126.9245) - 여의도

**샘플 요청 2개:**
1. 화장실 누수 (37.5012, 127.0396) - 강남구 역삼동
2. 주방 배수구 막힘 (37.4833, 127.0322) - 서초구 서초동

## 🔌 API 엔드포인트

### 고객 요청
- `POST /api/requests` - 새 요청 생성 (latitude, longitude, imageUrl 포함)
- `GET /api/requests` - 모든 요청 조회
- `PATCH /api/requests/:id` - 요청 상태 업데이트

### 설비 업체
- `GET /api/contractors` - 모든 업체 조회

## 📦 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# Prisma Client 재생성
npx prisma generate

# 데이터베이스 푸시 (스키마 변경 시)
npx prisma db push

# 시드 데이터 재삽입
npm run db:seed

# Prisma Studio 실행 (DB GUI)
npx prisma studio
```

## 🛠️ 트러블슈팅

### 네이버 지도가 안 보이는 경우
```bash
# 브라우저 콘솔에서 window.naver 확인
# .env 파일의 API 키 확인
# 서버 재시작
npm run dev
```

### Prisma Client 에러
```bash
npx prisma generate
npm run dev
```

## 🔧 향후 개발 아이디어

- [ ] 업체 자동 매칭 알고리즘 (거리 + 평점 + 가용성)
- [ ] 사용자 인증 (로그인/회원가입)
- [ ] 실시간 알림 (Socket.io)
- [ ] 채팅 기능 (고객 ↔ 업체)
- [ ] 결제 시스템 연동
- [ ] 리뷰 및 평가 시스템
- [ ] 이미지 최적화 (CDN 업로드)
- [ ] 관리자 인증
- [ ] 대시보드 그래프/차트
- [ ] 모바일 앱 (React Native)

## 📝 기술 노트

### 주요 의존성
- `next@16.1.6` - React 프레임워크
- `@prisma/client@6.19.2` - ORM
- `tailwindcss@4` - CSS 프레임워크
- `shadcn/ui` - UI 컴포넌트
- `lucide-react` - 아이콘

### 네이버 지도 API
- Web Dynamic Map v3
- Geocoding API (Reverse)
- 클라이언트 ID 기반 인증

### Haversine 공식
```typescript
// lib/distance.ts
// 두 위경도 간 직선 거리 계산 (km)
calculateDistance(lat1, lon1, lat2, lon2)
```

## 📄 라이센스

MIT License

## 👨‍💻 개발 정보

**프로젝트**: FixMatch MVP V2
**개발 기간**: 2026년 3월
**상태**: ✅ 완료 및 실행 중

---

**시작하기**: `npm run dev` → http://localhost:3000 🚀

**새로운 기능**: 네이버 지도 + 사진 첨부 + 거리 기반 추천 🗺️📷📍
