# 고쳐줘 / Repause — 통합 Next.js 플랫폼

두 가지 서비스가 공존하는 모노레포입니다.

- **고쳐줘**: 집수리 중개 플랫폼 (고객 요청 → 관리자가 업체 매칭)
- **Repause**: 프리미엄 독채 스테이 예약 플랫폼 (크리오스 외주)

## 배포

- 프로덕션: https://gochiwo-production.up.railway.app
- 플랫폼: Railway (main 브랜치 push 시 자동 배포)

## 기술 스택

- Next.js 16.1.6 (App Router, Turbopack) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma 6.19.2 + SQLite
- 네이버 지도 API (`ncpKeyId` 파라미터)
- 네이버 SMTP/IMAP (nodemailer + imapflow)
- Node.js 20.20.0

## 빠른 시작

```bash
# Node 20 활성화
nvm use 20

# 개발 서버
npm run dev

# DB 초기화
npx prisma db push && npm run db:seed
```

서버: http://localhost:3000

## 환경 변수 (.env)

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID="..."
NAVER_MAP_CLIENT_SECRET="..."
GEMINI_API_KEY="..."
NAVER_SMTP_USER="..."
NAVER_SMTP_PASS="..."
ADMIN_PASSWORD="..."
```

## 주요 라우트

| 경로 | 설명 |
|------|------|
| `/` | 고쳐줘 메인 랜딩 |
| `/request` | 고객 수리 요청 폼 (지도+사진) |
| `/admin` | 고쳐줘 + Repause 통합 관리자 대시보드 |
| `/estimate` | 수리 견적 계산기 |
| `/stays` | Repause 숙소 목록 |
| `/stays/[slug]` | 숙소 상세 |
| `/reservation` | Repause 예약 폼 (일반/제휴) |
| `/space` | 공간 소개 |
| `/brand` | 브랜드 소개 |
| `/partnership` | 제휴 안내 |
| `/guide` | 이용 안내 |

## Repause 요금 정책

| 구분 | 요금 |
|------|------|
| 평일(일~목) | 340,000원/박 |
| 주말(금·토) | 390,000원/박 |
| 추가 인원 | 40,000원/인 (기본 2인) |
| 제휴 임직원 | 12% 할인 |

## 트러블슈팅

```bash
# Prisma Client 에러
npx prisma generate && npm run dev

# 네이버 지도 안 보임
# → .env 의 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 확인
# → ncpKeyId 파라미터인지 확인 (ncpClientId 아님)
```
