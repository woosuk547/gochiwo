'use client'

import Image from 'next/image'

interface AdminLoginCardProps {
  adminId: string
  password: string
  error: string
  loading: boolean
  onChange: (field: 'adminId' | 'password', value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function AdminLoginCard(props: AdminLoginCardProps) {
  return (
    <div className="flex min-h-screen">
      {/* 좌측 이미지 패널 */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/repause/editorial-living.jpg"
          alt="리포즈"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-10 left-10">
          <p className="text-[13px] font-medium tracking-[0.15em] text-white/50 uppercase">Repause Admin</p>
          <p className="mt-2 text-[1.6rem] font-extralight text-white">운영 관리자</p>
        </div>
      </div>

      {/* 우측 로그인 폼 */}
      <div className="flex w-full items-center justify-center bg-[#f7f7f7] px-8 lg:w-1/2">
        <div className="w-full max-w-[360px]">
          <div className="mb-10">
            <p className="text-[11px] font-medium tracking-[0.2em] text-gray-400 uppercase lg:hidden">Repause Admin</p>
            <h1 className="mt-2 text-[1.6rem] font-semibold text-[#1a1a1a]">로그인</h1>
            <p className="mt-1 text-[13px] text-gray-400">관리자 계정으로 접속하세요.</p>
          </div>

          <form onSubmit={props.onSubmit} className="space-y-4">
            {props.error && (
              <div className="rounded-none border-l-2 border-red-500 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                {props.error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">관리자 ID</label>
              <input
                type="text"
                autoComplete="username"
                value={props.adminId}
                onChange={(e) => props.onChange('adminId', e.target.value)}
                placeholder="아이디 입력"
                className="w-full rounded-none border-b border-gray-200 bg-transparent px-0 h-11 text-[14px] text-[#1a1a1a] placeholder:text-gray-300 outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] tracking-[0.12em] font-medium text-gray-400 uppercase">비밀번호</label>
              <input
                type="password"
                autoComplete="current-password"
                value={props.password}
                onChange={(e) => props.onChange('password', e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full rounded-none border-b border-gray-200 bg-transparent px-0 h-11 text-[14px] text-[#1a1a1a] placeholder:text-gray-300 outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={props.loading}
              className="mt-4 w-full rounded-none bg-[#1a1a1a] h-12 text-[14px] font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-50"
            >
              {props.loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
