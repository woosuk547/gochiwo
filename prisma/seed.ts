import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Repause 시드 데이터 삽입 시작...')

  await prisma.blockedDate.deleteMany()
  await prisma.reservation.deleteMany()

  // 차단일 예시 (운영 준비 기간)
  const blockedDates = [
    { date: new Date('2026-06-01'), label: '운영 준비' },
    { date: new Date('2026-06-02'), label: '운영 준비' },
    { date: new Date('2026-06-03'), label: '내부 점검' },
  ]

  for (const item of blockedDates) {
    await prisma.blockedDate.create({ data: item })
  }

  // 테스트 예약
  await prisma.reservation.create({
    data: {
      source: 'DIRECT',
      status: 'CONFIRMED',
      guestName: '김테스트',
      email: 'test@example.com',
      phone: '010-1234-5678',
      guests: 2,
      checkIn: new Date('2026-06-20'),
      checkOut: new Date('2026-06-22'),
      arrivalTime: '18:00 이전',
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      baseAmount: 1460000,
      extraGuestAmount: 0,
      discountAmount: 0,
      finalAmount: 1460000,
      depositAmount: 730000,
      paidAt: new Date('2026-06-10'),
    },
  })

  await prisma.reservation.create({
    data: {
      source: 'PARTNERSHIP',
      status: 'PENDING',
      guestName: '이제휴',
      companyName: '다이슨 코리아',
      email: 'partner@dyson.co.kr',
      phone: '010-9876-5432',
      guests: 3,
      checkIn: new Date('2026-07-01'),
      checkOut: new Date('2026-07-03'),
      arrivalTime: '20:00 이후',
      benefitLabel: '제휴 임직원 전용 요금',
      paymentMethod: 'CORPORATE_BILLING',
      paymentStatus: 'REVIEW_PENDING',
      baseAmount: 1560000,
      extraGuestAmount: 80000,
      discountAmount: 196800,
      finalAmount: 1443200,
      depositAmount: 0,
    },
  })

  console.log('✅ Repause 시드 데이터 삽입 완료')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
