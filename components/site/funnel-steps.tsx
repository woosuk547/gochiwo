const steps = ['일정 · 정보 입력', '결제', '예약 확정'] as const

interface FunnelStepsProps {
  current: 1 | 2 | 3
  className?: string
}

export function FunnelSteps({ current, className }: FunnelStepsProps) {
  return (
    <ol aria-label="예약 진행 단계" className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 ${className ?? ''}`}>
      {steps.map((label, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === current
        const isDone = stepNumber < current
        return (
          <li key={label} className="flex items-center gap-2" aria-current={isActive ? 'step' : undefined}>
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                isActive
                  ? 'bg-[#1a1a1a] text-white'
                  : isDone
                    ? 'border border-[#1a1a1a] text-[#1a1a1a]'
                    : 'border border-gray-200 text-gray-400'
              }`}
            >
              {isDone ? '✓' : stepNumber}
            </span>
            <span className={`text-[12px] ${isActive ? 'font-semibold text-[#1a1a1a]' : isDone ? 'text-gray-600' : 'text-gray-400'}`}>
              {label}
            </span>
            {index < steps.length - 1 && <span aria-hidden="true" className="ml-1 h-px w-5 bg-gray-200" />}
          </li>
        )
      })}
    </ol>
  )
}
