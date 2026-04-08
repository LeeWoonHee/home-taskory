import { Suspense } from 'react'
import type { SubscriptionsResponse } from './lib/types'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import SubscriptionCard from './components/SubscriptionCard'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getSubscriptions(params: Record<string, string | string[] | undefined>): Promise<SubscriptionsResponse> {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      query.set(key, value)
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const url = `${baseUrl}/api/subscriptions?${query.toString()}`

  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(`Failed to fetch subscriptions: ${res.status}`)
  }

  return res.json() as Promise<SubscriptionsResponse>
}

async function getAllSubscriptions(): Promise<SubscriptionsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/subscriptions`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch all subscriptions')
  return res.json() as Promise<SubscriptionsResponse>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams

  const [data, allData] = await Promise.all([
    getSubscriptions(params),
    getAllSubscriptions(),
  ])

  const { subscriptions, total, lastUpdated } = data
  const allSubscriptions = allData.subscriptions

  const ongoingCount = allSubscriptions.filter((s) => s.status === 'ongoing').length
  const upcomingCount = allSubscriptions.filter((s) => s.status === 'upcoming').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lastUpdated={lastUpdated} />

      <Suspense fallback={null}>
        <FilterBar subscriptions={allSubscriptions} />
      </Suspense>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">전체</span>
            <span className="font-bold text-gray-900">{allSubscriptions.length}건</span>
          </div>
          <div className="h-4 w-px bg-gray-300" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-500">청약중</span>
            <span className="font-bold text-red-600">{ongoingCount}건</span>
          </div>
          <div className="h-4 w-px bg-gray-300" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-500">청약예정</span>
            <span className="font-bold text-amber-600">{upcomingCount}건</span>
          </div>
          {total !== allSubscriptions.length && (
            <>
              <div className="h-4 w-px bg-gray-300" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <span className="text-gray-500">필터 결과</span>
                <span className="font-bold text-gray-900">{total}건</span>
              </div>
            </>
          )}
        </div>

        {/* Subscription grid */}
        {subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              검색 결과가 없습니다
            </h2>
            <p className="text-gray-500 text-sm">
              다른 필터 조건을 선택해 보세요.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
