'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function PaymentEmailGate({
  reservationId,
  initialError = '',
}: {
  reservationId: string
  initialError?: string
}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(initialError)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      setError('예약 시 사용한 이메일을 입력해 주세요.')
      return
    }
    router.replace(`/payment/${reservationId}?email=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-none border border-gray-200 bg-white p-6 space-y-4">
      <p className="text-[14px] leading-relaxed text-gray-600">
        개인정보 보호를 위해 예약에 사용한 이메일로 본인 확인이 필요해요.
      </p>
      <label className="block space-y-1.5">
        <span className="text-[13px] font-medium text-gray-500">예약 이메일</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-none border border-gray-200 px-3 text-[15px] outline-none focus:border-[#1a1a1a]"
          placeholder="name@example.com"
          autoComplete="email"
          required
        />
      </label>
      {error && <p className="text-[13px] text-red-600">{error}</p>}
      <Button type="submit" className="h-12 w-full rounded-none bg-[#1a1a1a] text-white hover:bg-[#333]">
        확인
      </Button>
    </form>
  )
}
