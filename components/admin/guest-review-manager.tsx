'use client'

import { useEffect, useState } from 'react'
import type { GuestReview } from '@/lib/reviews'

const fieldClassName =
  'w-full rounded-none border border-gray-200 bg-white px-4 h-11 text-sm text-[#1a1a1a] placeholder:text-gray-300 outline-none focus:border-[#1a1a1a] transition-colors'

export function GuestReviewManager() {
  const [reviews, setReviews] = useState<GuestReview[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ quote: '', guestLabel: '', stayedAt: '' })

  async function load() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/reviews', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '후기를 불러오지 못했어요.')
      setReviews(data)
      setError('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '후기를 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, published: true }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '후기를 저장하지 못했어요.')
      setForm({ quote: '', guestLabel: '', stayedAt: '' })
      await load()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '후기를 저장하지 못했어요.')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(review: GuestReview) {
    const response = await fetch(`/api/admin/reviews/${review.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !review.published }),
    })
    if (!response.ok) return
    await load()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('이 후기를 삭제할까요?')) return
    const response = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    if (!response.ok) return
    await load()
  }

  return (
    <div className="rounded-none border border-gray-200 bg-white p-4 md:p-5">
      <p className="text-[13px] font-semibold text-[#1a1a1a]">방문 후기</p>
      <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
        본인 동의를 받은 원문만 올려 주세요. 홈에는 공개된 후기만 보여요.
      </p>

      <form onSubmit={handleCreate} className="mt-4 space-y-3">
        <textarea
          required
          value={form.quote}
          onChange={(event) => setForm((prev) => ({ ...prev, quote: event.target.value }))}
          placeholder="후기 원문 (1~2문장)"
          rows={3}
          className="w-full rounded-none border border-gray-200 bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-gray-300 outline-none focus:border-[#1a1a1a]"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            value={form.guestLabel}
            onChange={(event) => setForm((prev) => ({ ...prev, guestLabel: event.target.value }))}
            placeholder="예: 4인 가족 · 2박"
            className={fieldClassName}
          />
          <input
            required
            value={form.stayedAt}
            onChange={(event) => setForm((prev) => ({ ...prev, stayedAt: event.target.value }))}
            placeholder="예: 2026년 8월"
            className={fieldClassName}
          />
        </div>
        {error && <p className="text-[13px] text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] border border-[#1a1a1a] bg-[#1a1a1a] px-5 text-[13px] font-medium text-white hover:bg-transparent hover:text-[#1a1a1a] disabled:opacity-50"
        >
          {saving ? '저장 중...' : '후기 올리기'}
        </button>
      </form>

      <div className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
        {loading && <p className="py-4 text-[13px] text-gray-500">불러오는 중...</p>}
        {!loading && reviews.length === 0 && (
          <p className="py-4 text-[13px] text-gray-500">아직 등록된 후기가 없어요.</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[14px] leading-relaxed text-[#1a1a1a]">{review.quote}</p>
              <p className="mt-1 text-[12px] text-gray-500">
                {review.guestLabel} · {review.stayedAt}
                {review.published ? '' : ' · 비공개'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void togglePublished(review)}
                className="min-h-[44px] px-3 text-[12px] text-gray-500 underline-offset-2 hover:text-[#1a1a1a] hover:underline"
              >
                {review.published ? '숨기기' : '공개'}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(review.id)}
                className="min-h-[44px] px-3 text-[12px] text-red-600 underline-offset-2 hover:underline"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
