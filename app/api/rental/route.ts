import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendRentalInquiryNotification } from '@/lib/mailer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      companyName,
      brandWebsite,
      purpose,
      rentalDate,
      duration,
      totalGuests,
      useSpace,
      note,
      contactName,
      contactEmail,
      contactPhone,
    } = body

    if (!companyName || !purpose || !rentalDate || !totalGuests || !useSpace || !contactName || !contactEmail || !contactPhone) {
      return NextResponse.json({ error: '필수 입력 항목이 누락되었습니다.' }, { status: 400 })
    }

    // DB 저장
    const inquiry = await prisma.rentalInquiry.create({
      data: {
        companyName,
        brandWebsite: brandWebsite || null,
        purpose,
        rentalDate,
        duration: duration || '',
        totalGuests: Number(totalGuests),
        useSpace,
        note: note || null,
        contactName,
        contactEmail,
        contactPhone,
      },
    })

    // 이메일 발송
    try {
      await sendRentalInquiryNotification({
        companyName,
        brandWebsite,
        purpose,
        rentalDate,
        duration,
        totalGuests: Number(totalGuests),
        useSpace,
        note,
        contactName,
        contactEmail,
        contactPhone,
      })
    } catch (mailError) {
      console.error('대관문의 메일 발송 중 오류:', mailError)
      // 메일 발송이 실패하더라도 DB에는 성공적으로 저장되었으므로 완료 처리합니다.
    }

    return NextResponse.json({ success: true, id: inquiry.id })
  } catch (error) {
    console.error('대관 문의 접수 API 오류:', error)
    return NextResponse.json({ error: '대관 문의를 접수하는 도중 예기치 못한 오류가 발생했습니다.' }, { status: 500 })
  }
}
