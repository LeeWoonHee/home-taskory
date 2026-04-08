import type { Agency } from '../lib/types'

interface AgencyBadgeProps {
  agency: Agency
}

const agencyConfig: Record<Agency, { label: string; className: string }> = {
  SH: {
    label: 'SH',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  LH: {
    label: 'LH',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  GH: {
    label: 'GH',
    className: 'bg-violet-100 text-violet-700 border border-violet-200',
  },
}

export default function AgencyBadge({ agency }: AgencyBadgeProps) {
  const config = agencyConfig[agency]

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  )
}
