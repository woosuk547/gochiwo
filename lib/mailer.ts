import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { formatCurrency, paymentMethodLabel, type PaymentMethod, type ReservationSource } from '@/lib/booking'
import { getAppUrl } from '@/lib/app-url'
import { contactInfo } from './repause-content'

const transporter = nodemailer.createTransport({
  host: "smtp.naver.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NAVER_SMTP_USER,
    pass: process.env.NAVER_SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
}

export async function sendMail({ to, subject, html, senderName }: MailOptions) {
  await transporter.sendMail({
    from: `"${senderName ?? contactInfo.brand}" <${process.env.NAVER_SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

// 고객 요청 접수 확인 메일
export async function sendRequestConfirmation(to: string, requestId: string) {
  await sendMail({
    to,
    subject: "[고쳐줘] 집수리 요청이 접수되었습니다",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">집수리 요청 접수 완료</h2>
        <p>안녕하세요! 집수리 요청(#${requestId})이 정상적으로 접수되었습니다.</p>
        <p>담당자가 검토 후 빠르게 전문가를 연결해 드리겠습니다.</p>
        <hr />
        <p style="color: #6b7280; font-size: 14px;">고쳐줘 집수리 중개 플랫폼</p>
      </div>
    `,
  });
}

export interface InboxMail {
  uid: number;
  subject: string;
  from: string;
  date: Date | null;
  text: string;
  html: string;
  seen: boolean;
}

// 받은 편지함 조회 (최근 N개)
export async function fetchInbox(limit = 20): Promise<InboxMail[]> {
  const client = new ImapFlow({
    host: "imap.naver.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.NAVER_SMTP_USER as string,
      pass: process.env.NAVER_SMTP_PASS as string,
    },
    logger: false,
  });

  await client.connect();

  const mails: InboxMail[] = [];

  try {
    const mailbox = await client.mailboxOpen("INBOX");
    const total = mailbox.exists;
    // 최신순으로 limit개만 가져오기
    const start = Math.max(1, total - limit + 1);

    for await (const msg of client.fetch(`${start}:*`, {
      uid: true,
      flags: true,
      source: true,
    })) {
      if (!msg.source) continue;
      const parsed = await simpleParser(msg.source as Buffer);
      mails.push({
        uid: msg.uid,
        subject: parsed.subject ?? "(제목 없음)",
        from: parsed.from?.text ?? "",
        date: parsed.date ?? null,
        text: parsed.text ?? "",
        html: typeof parsed.html === "string" ? parsed.html : "",
        seen: msg.flags?.has("\\Seen") ?? false,
      });
    }
  } finally {
    await client.logout();
  }

  return mails.reverse(); // 최신순 정렬
}

// 업체 매칭 완료 알림 메일
export async function sendMatchNotification(to: string, contractorName: string) {
  await sendMail({
    to,
    subject: "[고쳐줘] 전문가가 매칭되었습니다",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">전문가 매칭 완료</h2>
        <p><strong>${contractorName}</strong> 전문가가 방문 일정을 조율할 예정입니다.</p>
        <p>곧 연락 드리겠습니다.</p>
        <hr />
        <p style="color: #6b7280; font-size: 14px;">고쳐줘 집수리 중개 플랫폼</p>
      </div>
    `,
  });
}

const repauseEmailBase = (body: string, isConfirmation = false) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Apple SD Gothic Neo', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e5; color: #1a1a1a;">
  <!-- 헤더 -->
  <div style="padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #f0f0f0;">
    <p style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; letter-spacing: 0;">Repause</p>
  </div>
  
  <!-- 본문 -->
  <div style="padding: 48px 48px 40px; line-height: 1.8; font-size: 14px;">
    ${body}
  </div>

  <!-- 푸터 -->
  <div style="background-color: #f8f8f8; padding: 36px 48px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666666; line-height: 1.8;">
    <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Repause</p>
    <p style="margin: 0 0 12px;">본 메일은 리포즈 예약 시스템에서 자동 발송된 안내 메일입니다.</p>
    <div style="width: 100%; height: 1px; background-color: #e5e5e5; margin: 12px 0;"></div>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #666666;">
      <tr>
        <td style="padding: 2px 0; width: 80px;">운영 법인</td>
        <td style="padding: 2px 0;">${contactInfo.company}</td>
      </tr>
      <tr>
        <td style="padding: 2px 0;">대표 번호</td>
        <td style="padding: 2px 0;">${contactInfo.phone}</td>
      </tr>
      <tr>
        <td style="padding: 2px 0;">문의</td>
        <td style="padding: 2px 0;"><a href="mailto:${contactInfo.email}" style="color: #666666; text-decoration: underline;">${contactInfo.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 2px 0;">웹사이트</td>
        <td style="padding: 2px 0;"><a href="https://repause.co.kr" target="_blank" style="color: #666666; text-decoration: none;">repause.co.kr</a></td>
      </tr>
    </table>
    <p style="margin: 16px 0 0; font-size: 11px; color: #999999;">© 2026 Repause. All rights reserved.</p>
  </div>
</div>
`

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface ReservationConfirmationOptions {
  to: string
  guestName: string
  reservationId: string
  checkIn: string
  checkOut: string
  source: ReservationSource
  paymentMethod: PaymentMethod
  benefitLabel: string | null
  finalAmount: number
  depositAmount: number
}

export async function sendReservationConfirmation(options: ReservationConfirmationOptions) {
  const needsImmediatePayment =
    options.paymentMethod === 'CARD' || options.paymentMethod === 'BANK_TRANSFER'
  const safeName = escapeHtml(options.guestName)
  const safeBenefit = options.benefitLabel ? escapeHtml(options.benefitLabel) : ''
  const appUrl = getAppUrl()
  const paymentLink = `${appUrl}/payment/${options.reservationId}`
  const lookupLink = `${appUrl}/my-reservation`

  const paymentLine =
    options.paymentMethod === 'CORPORATE_BILLING'
      ? '법인 결제 일정은 확인 후 세금계산서 또는 별도 방식으로 안내드려요.'
      : `예상 결제 금액은 <strong>${formatCurrency(options.finalAmount)}</strong>이며, 예약금(50%)은 <strong>${formatCurrency(options.depositAmount)}</strong>입니다.`

  const nextStep = needsImmediatePayment
    ? `* 일정은 <strong>12시간</strong> 동안 임시 확보됩니다. 결제를 완료해 주시면 예약이 확정됩니다.<br />
        * 아래 버튼으로 결제를 이어 주세요. 기한 내 미결제 시 일정이 자동 해제됩니다.`
    : `* 신청을 확인한 뒤 안내드릴게요. 예약 번호로 조회 페이지에서 상태를 확인할 수 있어요.`

  const paymentCta = needsImmediatePayment
    ? `<div style="margin: 28px 0 32px; text-align: center;">
         <a href="${paymentLink}" target="_blank" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 14px; padding: 14px 32px; font-weight: 600;">결제 이어가기</a>
       </div>`
    : ''

  await sendMail({
    to: options.to,
    subject: needsImmediatePayment
      ? '[Repause] 예약 접수 — 결제를 완료해 주세요'
      : '[Repause] 예약 신청이 도착했습니다',
    senderName: 'Repause',
    html: repauseEmailBase(`
      <h2 style="font-size: 22px; font-weight: 700; line-height: 1.4; margin: 0 0 12px; color: #1a1a1a;">안녕하세요, ${safeName}님</h2>
      <p style="font-size: 14px; color: #666666; margin: 0 0 32px; line-height: 1.7;">
        리포즈를 선택해 주셔서 감사합니다.<br />
        ${needsImmediatePayment
          ? '예약 정보가 접수되었습니다. 결제를 완료하시면 예약이 확정됩니다.'
          : '예약 신청을 확인한 뒤 안내드릴게요.'}
      </p>

      <div style="margin-bottom: 36px; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; background-color: #f8f8f8; padding: 24px 28px;">
        <p style="font-size: 12px; letter-spacing: 0.1em; color: #999999; margin: 0 0 16px; font-weight: 600;">예약 정보</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #1a1a1a;">
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666; width: 110px;">예약 번호</td>
            <td style="padding: 12px 0; font-weight: 500; text-align: right;"><strong>${escapeHtml(options.reservationId)}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">체크인</td>
            <td style="padding: 12px 0; font-weight: 500; text-align: right;"><strong>${escapeHtml(options.checkIn)} (16:00 입실)</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">체크아웃</td>
            <td style="padding: 12px 0; font-weight: 500; text-align: right;"><strong>${escapeHtml(options.checkOut)} (11:00 퇴실)</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">예약 구분</td>
            <td style="padding: 12px 0; text-align: right;">${options.source === 'PARTNERSHIP' ? '제휴 예약' : '일반 예약'}</td>
          </tr>
          ${safeBenefit ? `
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">제휴 구분</td>
            <td style="padding: 12px 0; text-align: right;"><strong>${safeBenefit}</strong></td>
          </tr>` : ''}
          <tr>
            <td style="padding: 12px 0; color: #666666;">결제 수단</td>
            <td style="padding: 12px 0; text-align: right;">${paymentMethodLabel[options.paymentMethod]}</td>
          </tr>
        </table>
      </div>

      ${paymentCta}

      <div style="background-color: #f8f8f8; padding: 24px 28px; margin-bottom: 32px; font-size: 13px; color: #666666; line-height: 1.7; border: 1px solid #e5e5e5;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #1a1a1a;">결제 안내</p>
        <p style="margin: 0;">${paymentLine}</p>
      </div>

      <p style="font-size: 13px; line-height: 1.8; color: #666666; margin: 0 0 12px;">
        ${nextStep}
      </p>
      <p style="font-size: 13px; line-height: 1.8; color: #666666; margin: 0;">
        예약 조회: <a href="${lookupLink}" style="color: #1a1a1a; text-decoration: underline;">${lookupLink}</a>
      </p>
    `, true),
  })
}

interface ReservationConfirmedOptions {
  to: string
  guestName: string
  checkIn: string
  checkOut: string
  guests: number
  finalAmount: number
  paymentMethod: PaymentMethod
  paidAmount?: number
  isDepositOnly?: boolean
  /** false면 관리자 확정(미결제) 안내 */
  paymentCompleted?: boolean
}

export async function sendReservationConfirmed(options: ReservationConfirmedOptions) {
  const paymentCompleted = options.paymentCompleted !== false
  const isDeposit = options.isDepositOnly ?? false
  const paid = options.paidAmount ?? (paymentCompleted ? options.finalAmount : 0)
  const remaining = options.finalAmount - paid

  if (!paymentCompleted) {
    await sendMail({
      to: options.to,
      subject: '[Repause] 예약이 확정되었습니다',
      senderName: 'Repause',
      html: repauseEmailBase(`
        <h2 style="font-size: 22px; font-weight: 700; line-height: 1.4; margin: 0 0 12px; color: #1a1a1a;">예약이 확정되었습니다</h2>
        <p style="font-size: 14px; color: #666666; margin: 0 0 32px; line-height: 1.7;">
          ${options.guestName}님, 감사합니다.<br />
          예약이 확정되었습니다.
          ${options.paymentMethod === 'CORPORATE_BILLING' ? '<br />법인 결제는 별도로 안내드려요.' : '<br />결제가 필요하면 안내 메일을 보내드려요.'}
        </p>
        <div style="margin-bottom: 36px; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; background-color: #f8f8f8; padding: 24px 28px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #1a1a1a;">
            <tr style="border-bottom: 1px solid #e5e5e5;">
              <td style="padding: 12px 0; color: #666666; width: 110px;">체크인</td>
              <td style="padding: 12px 0; font-weight: 500; text-align: right;"><strong>${options.checkIn} (16:00 입실)</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e5e5;">
              <td style="padding: 12px 0; color: #666666;">체크아웃</td>
              <td style="padding: 12px 0; font-weight: 500; text-align: right;"><strong>${options.checkOut} (11:00 퇴실)</strong></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #666666;">체류 인원</td>
              <td style="padding: 12px 0; text-align: right;">${options.guests}명</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 13px; line-height: 1.8; color: #666666; margin: 0;">
          문의: <a href="mailto:creaos@naver.com" style="color: #1a1a1a; text-decoration: underline;">creaos@naver.com</a>
        </p>
      `),
    })
    return
  }

  await sendMail({
    to: options.to,
    subject: "[Repause] 결제 완료 및 예약 최종 확정 안내",
    senderName: "Repause",
    html: repauseEmailBase(`
      <h2 style="font-size: 22px; font-weight: 700; line-height: 1.4; margin: 0 0 12px; color: #1a1a1a;">예약 및 결제가 완료되었습니다</h2>
      <p style="font-size: 14px; color: #666666; margin: 0 0 32px; line-height: 1.7;">
        ${options.guestName}님, 감사합니다.<br />
        결제가 정상 완료되었으며 <strong>예약이 최종 확정</strong>되었습니다.
      </p>

      <!-- 예약 정보 -->
      <div style="margin-bottom: 36px; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; background-color: #f8f8f8; padding: 24px 28px;">
        <p style="font-size: 12px; letter-spacing: 0.1em; color: #999999; margin: 0 0 16px; font-weight: 600;">CONFIRMED DETAILS</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #1a1a1a;">
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666; width: 110px;">체크인</td>
            <td style="padding: 12px 0; font-weight: 500; text-align: right;"><strong>${options.checkIn} (16:00 입실)</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">체크아웃</td>
            <td style="padding: 12px 0; font-weight: 500; text-align: right;"><strong>${options.checkOut} (11:00 퇴실)</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">체류 인원</td>
            <td style="padding: 12px 0; text-align: right;">${options.guests}명 (기준 4인, 최대 6인)</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">총 결제액</td>
            <td style="padding: 12px 0; font-weight: 500; text-align: right; color: #1a1a1a;">${formatCurrency(options.finalAmount)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">금번 결제 금액</td>
            <td style="padding: 12px 0; font-weight: 600; text-align: right; color: #1a1a1a;">
              <strong>${formatCurrency(paid)} ${isDeposit ? '(예약금 50%)' : '(전액 완납)'}</strong>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">잔여 현장 정산액</td>
            <td style="padding: 12px 0; text-align: right; color: #1a1a1a;">
              ${isDeposit ? `<strong>${formatCurrency(remaining)}</strong> (입실 당일 정산)` : '<strong>0원 (완납 완료)</strong>'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #666666;">결제 수단</td>
            <td style="padding: 12px 0; text-align: right;">${paymentMethodLabel[options.paymentMethod]}</td>
          </tr>
        </table>
      </div>

      <!-- 체크인 가이드 -->
      <div style="background-color: #f8f8f8; padding: 24px 28px; border-radius: 12px; margin-bottom: 32px; font-size: 13px; color: #666666; line-height: 1.7; border: 1px solid #e5e5e5;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #1a1a1a;">체크인 안내</p>
        <p style="margin: 0;">
          출입 비밀번호, 오시는 길 등 체크인 가이드는 <strong>체크인 당일 오전 10시경</strong> 메일과 문자로 발송됩니다.
        </p>
      </div>

      <p style="font-size: 13px; line-height: 1.8; color: #666666; margin: 0;">
        변경이나 취소, 문의는 <a href="mailto:creaos@naver.com" style="color: #1a1a1a; text-decoration: underline;">creaos@naver.com</a>으로 연락해 주세요.<br />
        리포즈에서 편안한 여정이 되시길 바랍니다.
      </p>
    `),
  })
}

interface PaymentGuideOptions {
  id: string
  to: string
  guestName: string
  checkIn: string
  checkOut: string
  finalAmount: number
  depositAmount: number
  paymentMethod: PaymentMethod
}

export async function sendPaymentGuide(options: PaymentGuideOptions) {
  const isCard = options.paymentMethod === 'CARD'
  const isCorp = options.paymentMethod === 'CORPORATE_BILLING'
  
  const appUrl = getAppUrl()
  const paymentLink = `${appUrl}/payment/${options.id}?email=${encodeURIComponent(options.to)}`

  const paymentDetail = isCorp
    ? '<p style="font-size: 14px; line-height: 1.9; color: #666666;">법인 결제로 신청되었습니다. 세금계산서와 일정은 별도로 안내드려요. 숙박·결제 당사자는 슈가스테이입니다.</p>'
    : `<p style="font-size: 14px; line-height: 1.9; color: #666666;">
           카드·계좌이체 모두 토스페이먼츠로 진행돼요. 숙박·결제 당사자는 슈가스테이입니다.<br />
           예약금 <strong>${formatCurrency(options.depositAmount)}</strong>을 결제해 주시면 예약이 확정됩니다.
         </p>
         <div style="margin: 32px 0; text-align: center;">
           <a href="${paymentLink}" target="_blank" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 14px; padding: 14px 32px; font-weight: 600;">
             ${isCard ? '카드 결제하기' : '결제 이어가기'}
           </a>
         </div>`

  await sendMail({
    to: options.to,
    subject: "[Repause] 예약금 결제 및 입금 프로세스 안내",
    senderName: "Repause",
    html: repauseEmailBase(`
      <h2 style="font-size: 22px; font-weight: 700; line-height: 1.4; margin: 0 0 12px; color: #1a1a1a;">결제 안내드립니다</h2>
      <p style="font-size: 14px; color: #666666; margin: 0 0 32px; line-height: 1.7;">
        ${options.guestName}님, 예약 승인이 완료되었습니다.<br />
        아래 정보를 확인하시고 예약금(50%) 결제를 진행해 주세요.
      </p>

      <!-- 예약 정보 -->
      <div style="margin-bottom: 36px; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; background-color: #f8f8f8; padding: 24px 28px;">
        <p style="font-size: 12px; letter-spacing: 0.1em; color: #999999; margin: 0 0 16px; font-weight: 600;">RESERVATION QUOTE</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #1a1a1a;">
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666; width: 110px;">체크인</td>
            <td style="padding: 12px 0; font-weight: 500; text-align: right;"><strong>${options.checkIn}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">체크아웃</td>
            <td style="padding: 12px 0; font-weight: 500; text-align: right;"><strong>${options.checkOut}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #666666;">총 숙박금액</td>
            <td style="padding: 12px 0; font-weight: 500; text-align: right;">${formatCurrency(options.finalAmount)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600;">예약금 (50%)</td>
            <td style="padding: 12px 0; font-weight: 700; text-align: right; color: #1a1a1a; font-size: 14px;"><strong>${formatCurrency(options.depositAmount)}</strong></td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #666666;">결제수단</td>
            <td style="padding: 12px 0; text-align: right;">${paymentMethodLabel[options.paymentMethod]}</td>
          </tr>
        </table>
      </div>

      ${paymentDetail}

      <p style="font-size: 13px; line-height: 1.8; color: #666666; margin: 24px 0 0;">
        * 결제 확인 후 1시간 이내에 <strong>예약 최종 확정 안내</strong>를 보내드립니다.<br />
        * 입금 기한(12시간) 초과 시 예약이 자동 취소될 수 있습니다.
      </p>
    `),
  })
}

interface RentalInquiryNotificationOptions {
  companyName: string
  brandWebsite?: string
  purpose: string
  rentalDate: string
  duration: string
  totalGuests: number
  useSpace: string
  note?: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

export async function sendRentalInquiryNotification(options: RentalInquiryNotificationOptions) {
  const websiteLine = options.brandWebsite
    ? `<tr style="border-bottom: 1px solid #e5e5e5;"><td style="padding: 10px 0; color: #666666;">사이트 / URL</td><td style="padding: 10px 0; font-weight: 500; text-align: right;"><a href="${options.brandWebsite}" target="_blank" style="color: #1a1a1a; text-decoration: underline;">${options.brandWebsite}</a></td></tr>`
    : ''

  const noteLine = options.note
    ? `<div style="background-color: #f8f8f8; padding: 20px 24px; margin-bottom: 24px; font-size: 13px; color: #666666; line-height: 1.7; border: 1px solid #e5e5e5; white-space: pre-wrap;">
        <p style="margin: 0 0 6px; font-weight: 600; color: #1a1a1a;">촬영 콘셉트 및 요청사항</p>
        <p style="margin: 0;">${options.note}</p>
      </div>`
    : ''

  await sendMail({
    to: "creaos@naver.com",
    subject: `[Repause 대관문의] ${options.companyName} - 상업적 촬영 대관 신청서`,
    senderName: "Repause",
    html: repauseEmailBase(`
      <h2 style="font-size: 20px; font-weight: 700; line-height: 1.4; margin: 0 0 12px; color: #1a1a1a;">새로운 미디어 대관 문의가 접수되었습니다</h2>
      <p style="font-size: 14px; color: #666666; margin: 0 0 32px; line-height: 1.7;">
        <strong>${options.companyName}</strong>에서 제출한 대관 문의 상세 내역입니다.<br />
        내용을 면밀히 검토하신 후 신속히 연락해 주시기 바랍니다.
      </p>

      <!-- 신청 내역 테이블 -->
      <div style="margin-bottom: 28px; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; background-color: #f8f8f8; padding: 24px 28px;">
        <p style="font-size: 11px; letter-spacing: 0.1em; color: #999999; margin: 0 0 16px; font-weight: 600;">RENTAL DETAILS</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #1a1a1a;">
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 10px 0; color: #666666; width: 120px;">업체 / 브랜드명</td>
            <td style="padding: 10px 0; font-weight: 600; text-align: right;"><strong>${options.companyName}</strong></td>
          </tr>
          ${websiteLine}
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 10px 0; color: #666666;">촬영 카테고리</td>
            <td style="padding: 10px 0; text-align: right;">${options.purpose}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 10px 0; color: #666666;">희망 일시</td>
            <td style="padding: 10px 0; font-weight: 500; text-align: right; color: #1a1a1a;"><strong>${options.rentalDate}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 10px 0; color: #666666;">예상 소요 시간</td>
            <td style="padding: 10px 0; text-align: right;">${options.duration || '미기재'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 10px 0; color: #666666;">총 출입 인원</td>
            <td style="padding: 10px 0; font-weight: 500; text-align: right;">${options.totalGuests}명</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 10px 0; color: #666666;">사용 희망 공간</td>
            <td style="padding: 10px 0; text-align: right;">${options.useSpace}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 10px 0; color: #666666;">담당자 성함</td>
            <td style="padding: 10px 0; text-align: right;">${options.contactName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 10px 0; color: #666666;">담당자 이메일</td>
            <td style="padding: 10px 0; text-align: right;"><a href="mailto:${options.contactEmail}" style="color: #1a1a1a;">${options.contactEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666666;">담당자 연락처</td>
            <td style="padding: 10px 0; font-weight: 600; text-align: right;"><strong>${options.contactPhone}</strong></td>
          </tr>
        </table>
      </div>

      <!-- 요청사항 블록 -->
      ${noteLine}

      <p style="font-size: 13px; line-height: 1.8; color: #666666; margin: 0;">
        * 본 메일은 리포즈 대관 자동화 시스템에서 크리오스 전담 담당자에게 즉시 전달된 메일입니다.<br />
        * 대관 계약서 작성 및 예약 보증금(30만원) 수납 프로세스를 조속히 전개해 주시기 바랍니다.
      </p>
    `),
  })
}
