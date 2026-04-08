'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { Agency, SubscriptionType, SubscriptionStatus, Subscription } from '../lib/types'

interface FilterBarProps {
  subscriptions: Subscription[]
}

const AGENCIES: Array<{ value: Agency | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'SH', label: 'SH' },
  { value: 'LH', label: 'LH' },
  { value: 'GH', label: 'GH' },
]

const TYPES: Array<{ value: SubscriptionType | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'apt', label: '분양' },
  { value: 'rental', label: '임대' },
  { value: 'public-rental', label: '공공임대' },
  { value: 'officetel', label: '오피스텔' },
]

const STATUSES: Array<{ value: SubscriptionStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ongoing', label: '청약중' },
  { value: 'upcoming', label: '청약예정' },
  { value: 'closed', label: '마감' },
]

const REGIONS = ['ALL', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종']

export default function FilterBar({ subscriptions }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentAgency = (searchParams.get('agency') ?? 'ALL') as Agency | 'ALL'
  const currentType = (searchParams.get('type') ?? 'ALL') as SubscriptionType | 'ALL'
  const currentStatus = (searchParams.get('status') ?? 'ALL') as SubscriptionStatus | 'ALL'
  const currentRegion = searchParams.get('region') ?? 'ALL'

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'ALL') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  // Compute counts per agency (from all subscriptions before agency filter)
  const agencyCounts = AGENCIES.reduce<Record<string, number>>((acc, { value }) => {
    if (value === 'ALL') {
      acc[value] = subscriptions.length
    } else {
      acc[value] = subscriptions.filter((s) => s.agency === value).length
    }
    return acc
  }, {})

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Agency filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-14 shrink-0">
            기관
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {AGENCIES.map(({ value, label }) => {
              const isActive = currentAgency === value
              const count = agencyCounts[value] ?? 0
              return (
                <button
                  key={value}
                  onClick={() => updateFilter('agency', value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? value === 'SH'
                        ? 'bg-blue-600 text-white'
                        : value === 'LH'
                        ? 'bg-emerald-600 text-white'
                        : value === 'GH'
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  <span
                    className={`ml-1.5 text-xs ${
                      isActive ? 'opacity-80' : 'text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-14 shrink-0">
            유형
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {TYPES.map(({ value, label }) => {
              const isActive = currentType === value
              return (
                <button
                  key={value}
                  onClick={() => updateFilter('type', value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Status and Region filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-14 shrink-0">
              상태
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map(({ value, label }) => {
                const isActive = currentStatus === value
                return (
                  <button
                    key={value}
                    onClick={() => updateFilter('status', value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? value === 'ongoing'
                          ? 'bg-red-500 text-white'
                          : value === 'upcoming'
                          ? 'bg-amber-500 text-white'
                          : value === 'closed'
                          ? 'bg-gray-400 text-white'
                          : 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Region */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-14 shrink-0">
              지역
            </span>
            <select
              value={currentRegion}
              onChange={(e) => updateFilter('region', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region === 'ALL' ? '전체 지역' : region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
