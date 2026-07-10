import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendRentalInquiryNotification } from '@/lib/mailer'
import { isValidEmail, isValidPhone } from '@/lib/app-url'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : ''
    const brandWebsite = typeof body.brandWebsite === 'string' ? body.brandWebsite.trim() : ''
    const purpose = typeof body.purpose === 'string' ? body.purpose.trim() : ''
    const rentalDate = typeof body.rentalDate === 'string' ? body.rentalDate.trim() : ''
    const duration = typeof body.duration === 'string' ? body.duration.trim() : ''
    const totalGuests = Number(body.totalGuests)
    const useSpace = typeof body.useSpace === 'string' ? body.useSpace.trim() : ''
    const note = typeof body.note === 'string' ? body.note.trim() : ''
    const contactName = typeof body.contactName === 'string' ? body.contactName.trim() : ''
    const contactEmail = typeof body.contactEmail === 'string' ? body.contactEmail.trim().toLowerCase() : ''
    const contactPhone = typeof body.contactPhone === 'string' ? body.contactPhone.trim() : ''

    if (!companyName || !purpose || !rentalDate || !useSpace || !contactName || !contactEmail || !contactPhone) {
      return NextResponse.json({ error: '필수 입력 항목이 누락되었습니다.' }, { status: 400 })
    }

    if (!Number.isFinite(totalGuests) || totalGuests < 1 || totalGuests > 200) {
      return NextResponse.json({ error: '인원 수를 다시 확인해 주세요.' }, { status: 400 })
    }

    if (!isValidEmail(contactEmail)) {
      return NextResponse.json({ error: '올바른 이메일을 입력해 주세요.' }, { status: 400 })
    }

    if (!isValidPhone(contactPhone)) {
      return NextResponse.json({ error: '올바른 연락처를 입력해 주세요.' }, { status: 400 })
    }

    const inquiry = await prisma.rentalInquiry.create({
      data: {
        companyName,
        brandWebsite: brandWebsite || null,
        purpose,
        rentalDate,
        duration: duration || '',
        totalGuests,
        useSpace,
        note: note || null,
        contactName,
        contactEmail,
        contactPhone,
      },
    })

    try {
      await sendRentalInquiryNotification({
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
      })
    } catch (mailError) {
      console.error('대관문의 메일 발송 중 오류:', mailError)
    }

    return NextResponse.json({ success: true, id: inquiry.id })
  } catch (error) {
    console.error('대관 문의 접수 API 오류:', error)
    return NextResponse.json({ error: '대관 문의를 접수하는 도중 예기치 못한 오류가 발생했습니다.' }, { status: 500 })
  }
}
