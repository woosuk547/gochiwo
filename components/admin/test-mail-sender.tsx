'use client'

import { useState } from 'react'

export function TestMailSender() {
  const [email, setEmail] = useState('woosuk547@naver.com')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const sendTestEmails = async () => {
    setLoading(true)
    setStatus('메일 전송 프로세스를 시작합니다...')

    try {
      const response = await fetch('/api/admin/send-test-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (response.ok) {
        setStatus(`성공: ${data.message}`)
      } else {
        setStatus(`실패: ${data.error}`)
      }
    } catch (err) {
      setStatus(`에러 발생: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-8">
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-400">EMAIL TEST</p>
        <h2 className="mt-1.5 text-xl font-bold text-[#1a1a1a]">이메일 템플릿 테스트 발송</h2>
        <p className="mt-2 text-sm text-gray-500 leading-6">
          이메일 템플릿(접수완료, 예약확정, 결제안내)을 지정된 메일 주소로 즉시 전송하여 테스트합니다.
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-md">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400">수신 이메일 주소</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-400 transition-colors text-[#1a1a1a]"
            placeholder="이메일을 입력하세요"
          />
        </div>

        <button
          onClick={sendTestEmails}
          disabled={loading}
          className="h-11 rounded-xl bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          {loading ? '전송 중...' : '3가지 이메일 세트 즉시 전송하기'}
        </button>

        {status && (
          <div className="mt-2 rounded-xl bg-gray-50 border border-gray-100 p-4 text-xs leading-6 text-gray-500">
            <p className="font-semibold text-[#1a1a1a]">진행 결과:</p>
            <p className="mt-1 font-mono whitespace-pre-wrap">{status}</p>
          </div>
        )}
      </div>
    </div>
  )
}
