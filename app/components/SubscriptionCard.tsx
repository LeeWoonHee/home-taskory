import type { Subscription, SubscriptionType } from '../lib/types'
import AgencyBadge from './AgencyBadge'
import StatusBadge from './StatusBadge'

interface SubscriptionCardProps {
  subscription: Subscription
}

const typeLabels: Record<SubscriptionType, string> = {
  apt: '분양',
  rental: '임대',
  'public-rental': '공공임대',
  officetel: '오피스텔',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function formatPrice(won: number): string {
  if (won >= 10000) {
    const uk = Math.floor(won / 10000)
    const remainder = won % 10000
    if (remainder === 0) return `${uk}억`
    return `${uk}억 ${remainder.toLocaleString('ko-KR')}만`
  }
  return `${won.toLocaleString('ko-KR')}만`
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const {
    agency,
    name,
    type,
    status,
    location,
    district,
    totalUnits,
    applicationStart,
    applicationEnd,
    minPrice,
    maxPrice,
    specialSupply,
    url,
  } = subscription

  const totalSpecial = specialSupply
    ? (specialSupply.multiChild ?? 0) +
      (specialSupply.newlywed ?? 0) +
      (specialSupply.firstHome ?? 0) +
      (specialSupply.old ?? 0)
    : 0

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col">
      {/* Top badges */}
      <div className="p-4 pb-3 flex items-center gap-2 flex-wrap">
        <AgencyBadge agency={agency} />
        <StatusBadge status={status} />
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
          {typeLabels[type]}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 flex flex-col gap-3 flex-1">
        {/* Name */}
        <h2 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
          {name}
        </h2>

        {/* Location */}
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <span>📍</span>
          <span>
            {location} {district}
          </span>
        </p>

        {/* Details grid */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-xs text-gray-400 font-medium">총 세대수</dt>
            <dd className="text-gray-700 font-medium mt-0.5">
              {totalUnits.toLocaleString('ko-KR')}세대
            </dd>
          </div>

          {type === 'apt' && minPrice !== undefined && maxPrice !== undefined && (
            <div>
              <dt className="text-xs text-gray-400 font-medium">분양가</dt>
              <dd className="text-gray-700 font-medium mt-0.5">
                {formatPrice(minPrice)} ~ {formatPrice(maxPrice)}
              </dd>
            </div>
          )}
        </dl>

        {/* Dates */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs">
          <p className="text-gray-500 font-medium mb-1">청약 기간</p>
          <p className="text-gray-800 font-semibold">
            {formatDate(applicationStart)} ~ {formatDate(applicationEnd)}
          </p>
        </div>

        {/* Special supply */}
        {specialSupply && totalSpecial > 0 && (
          <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-medium text-gray-600">특별공급</span>
            {specialSupply.multiChild !== undefined && specialSupply.multiChild > 0 && (
              <span>다자녀 {specialSupply.multiChild}세대</span>
            )}
            {specialSupply.newlywed !== undefined && specialSupply.newlywed > 0 && (
              <span>신혼부부 {specialSupply.newlywed}세대</span>
            )}
            {specialSupply.firstHome !== undefined && specialSupply.firstHome > 0 && (
              <span>생애최초 {specialSupply.firstHome}세대</span>
            )}
            {specialSupply.old !== undefined && specialSupply.old > 0 && (
              <span>노부모 {specialSupply.old}세대</span>
            )}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="px-4 pb-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2 px-4 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors"
        >
          상세보기 →
        </a>
      </div>
    </article>
  )
}
