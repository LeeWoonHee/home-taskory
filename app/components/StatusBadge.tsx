import type { SubscriptionStatus } from '../lib/types'

interface StatusBadgeProps {
  status: SubscriptionStatus
}

const statusConfig: Record<
  SubscriptionStatus,
  { label: string; className: string; dotClassName?: string; pulse?: boolean }
> = {
  ongoing: {
    label: '청약중',
    className: 'bg-red-50 text-red-600 border border-red-200',
    dotClassName: 'bg-red-500',
    pulse: true,
  },
  upcoming: {
    label: '청약예정',
    className: 'bg-amber-50 text-amber-600 border border-amber-200',
    dotClassName: 'bg-amber-500',
    pulse: false,
  },
  closed: {
    label: '마감',
    className: 'bg-gray-100 text-gray-400 border border-gray-200',
    dotClassName: 'bg-gray-400',
    pulse: false,
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClassName}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotClassName}`}
        />
      </span>
      {config.label}
    </span>
  )
}
