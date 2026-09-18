'use client'

import { useState } from 'react'
import { formatCurrency, type DiscountCodeSummary } from '@/lib/booking'

interface DiscountCodeManagerProps {
  codes: DiscountCodeSummary[]
  onCreate: (input: {
    code: string
    label: string
    type: 'PERCENT' | 'FIXED'
    value: string
    maxUses: string
    expiresAt: string
    note: string
  }) => Promise<string | null>
  onUpdate: (id: string, updates: Record<string, unknown>) => Promise<string | null>
  onDelete: (id: string) => Promise<void>
}

function benefitText(code: DiscountCodeSummary) {
  return code.type === 'FIXED' ? formatCurrency(code.value) : `총액 ${code.value}%`
}

function usageText(code: DiscountCodeSummary) {
  return code.maxUses === null ? `${code.usedCount}회 / 무제한` : `${code.usedCount}회 / ${code.maxUses}회`
}

export function DiscountCodeManager({ codes, onCreate, onUpdate, onDelete }: DiscountCodeManagerProps) {
  const [form, setForm] = useState({
    code: '',
    label: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED',
    value: '10',
    maxUses: '',
    expiresAt: '',
    note: '',
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ label: '', value: '', maxUses: '', expiresAt: '' })
  const [editError, setEditError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const error = await onCreate(form)
    setSaving(false)
    if (error) {
      setFormError(error)
      return
    }
    setForm({ code: '', label: '', type: 'PERCENT', value: '10', maxUses: '', expiresAt: '', note: '' })
  }

  function startEdit(code: DiscountCodeSummary) {
    setEditingId(code.id)
    setEditError('')
    setEditForm({
      label: code.label,
      value: String(code.value),
      maxUses: code.maxUses === null ? '' : String(code.maxUses),
      expiresAt: code.expiresAt ?? '',
    })
  }

  async function handleEditSave(id: string) {
    setEditError('')
    const error = await onUpdate(id, {
      label: editForm.label,
      value: Number(editForm.value),
      maxUses: editForm.maxUses === '' ? null : Number(editForm.maxUses),
      expiresAt: editForm.expiresAt === '' ? null : editForm.expiresAt,
    })
    if (error) {
      setEditError(error)
      return
    }
    setEditingId(null)
  }

  async function handleCopy(code: DiscountCodeSummary) {
    try {
      await navigator.clipboard.writeText(code.code)
      setCopiedId(code.id)
      setTimeout(() => setCopiedId((prev) => (prev === code.id ? null : prev)), 1500)
    } catch {
      // 클립보드 실패는 무시
    }
  }

  const inputClass =
    'w-full rounded-none border border-gray-200 bg-white px-4 h-11 text-sm text-[#1a1a1a] placeholder:text-gray-300 outline-none focus:border-[#1a1a1a] transition-colors'

  return (
    <section className="rounded-none border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-4 md:px-6 md:py-5 lg:px-8">
        <p className="text-[11px] tracking-[0.15em] font-medium text-gray-400 uppercase">Discount Codes</p>
        <h2 className="mt-1 text-lg font-semibold text-[#1a1a1a]">할인코드 관리</h2>
        <p className="mt-1.5 text-[13px] text-gray-500">
          일반예약에서 쓰는 지인 할인코드예요. 코드는 대문자로 저장되고, 예약 1건당 1개만 쓸 수 있어요.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        <div className="border-b border-gray-100 p-4 md:p-6 lg:border-b-0 lg:border-r lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">코드 *</label>
              <input
                value={form.code}
                onChange={(e) => updateForm('code', e.target.value.toUpperCase())}
                placeholder="예: FRIEND10"
                required
                autoComplete="off"
                spellCheck={false}
                className={`${inputClass} uppercase tracking-wide`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">이름 *</label>
              <input
                value={form.label}
                onChange={(e) => updateForm('label', e.target.value)}
                placeholder="예: 지인 할인 10%"
                required
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">방식 *</label>
                <select
                  value={form.type}
                  onChange={(e) => updateForm('type', e.target.value as 'PERCENT' | 'FIXED')}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="PERCENT">정률 (%)</option>
                  <option value="FIXED">정액 (원)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">
                  {form.type === 'PERCENT' ? '할인율 *' : '할인액 *'}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.value}
                  onChange={(e) => updateForm('value', e.target.value)}
                  placeholder={form.type === 'PERCENT' ? '10' : '50000'}
                  required
                  min={form.type === 'PERCENT' ? 1 : 1000}
                  max={form.type === 'PERCENT' ? 90 : 5000000}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">횟수 상한</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.maxUses}
                  onChange={(e) => updateForm('maxUses', e.target.value)}
                  placeholder="무제한"
                  min={1}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">만료일</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => updateForm('expiresAt', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">메모 (선택)</label>
              <input
                value={form.note}
                onChange={(e) => updateForm('note', e.target.value)}
                placeholder="예: 9월 지인 초대용"
                className={inputClass}
              />
            </div>
            {formError && <p role="alert" className="text-[12px] text-red-500">{formError}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-none bg-[#1a1a1a] h-11 text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-50"
            >
              {saving ? '저장 중...' : '할인코드 추가'}
            </button>
          </form>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {codes.length === 0 && (
            <div className="border border-dashed border-gray-200 px-6 py-10 text-center">
              <p className="text-[13px] font-medium text-gray-400">등록된 할인코드가 없어요</p>
              <p className="mt-1 text-[12px] text-gray-300">좌측 폼에서 코드를 추가하세요.</p>
            </div>
          )}

          <div className="space-y-1.5">
            {codes.map((code) => (
              <div
                key={code.id}
                className={`border px-4 py-3 transition-colors ${code.active ? 'border-gray-100 hover:bg-gray-50' : 'border-gray-100 bg-gray-50/60'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold tracking-wide text-[#1a1a1a]">
                      {code.code}
                      {!code.active && (
                        <span className="ml-2 rounded-none bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">중지됨</span>
                      )}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-gray-500">
                      {code.label} · {benefitText(code)} · {usageText(code)} · {code.expiresAt ?? '상시'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(code)}
                      className="min-h-[36px] rounded-none border border-gray-200 px-3 text-[11px] text-gray-500 transition-colors hover:border-gray-400 hover:text-[#1a1a1a]"
                    >
                      {copiedId === code.id ? '복사됨' : '복사'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate(code.id, { active: !code.active })}
                      className="min-h-[36px] rounded-none border border-gray-200 px-3 text-[11px] text-gray-500 transition-colors hover:border-gray-400 hover:text-[#1a1a1a]"
                    >
                      {code.active ? '중지' : '재개'}
                    </button>
                    <button
                      type="button"
                      onClick={() => (editingId === code.id ? setEditingId(null) : startEdit(code))}
                      className="min-h-[36px] rounded-none border border-gray-200 px-3 text-[11px] text-gray-500 transition-colors hover:border-gray-400 hover:text-[#1a1a1a]"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(code.id)}
                      className="min-h-[36px] rounded-none border border-gray-200 px-3 text-[11px] text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {editingId === code.id && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={editForm.label}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, label: e.target.value }))}
                        placeholder="이름"
                        aria-label="코드 이름"
                        className={`${inputClass} col-span-2 h-10 text-[13px]`}
                      />
                      <input
                        type="number"
                        value={editForm.value}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
                        placeholder={code.type === 'PERCENT' ? '할인율 (%)' : '할인액 (원)'}
                        aria-label="할인 값"
                        className={`${inputClass} h-10 text-[13px]`}
                      />
                      <input
                        type="number"
                        value={editForm.maxUses}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, maxUses: e.target.value }))}
                        placeholder="횟수 상한 (무제한)"
                        aria-label="횟수 상한"
                        className={`${inputClass} h-10 text-[13px]`}
                      />
                      <input
                        type="date"
                        value={editForm.expiresAt}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                        aria-label="만료일"
                        className={`${inputClass} col-span-2 h-10 text-[13px]`}
                      />
                    </div>
                    {editError && <p role="alert" className="mt-2 text-[12px] text-red-500">{editError}</p>}
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditSave(code.id)}
                        className="h-10 flex-1 rounded-none bg-[#1a1a1a] text-[13px] font-medium text-white hover:bg-[#333]"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="h-10 flex-1 rounded-none border border-gray-200 text-[13px] text-gray-500 hover:text-[#1a1a1a]"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
