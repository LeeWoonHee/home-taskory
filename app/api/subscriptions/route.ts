import type { NextRequest } from 'next/server'
import type { Subscription, Agency, SubscriptionStatus, SubscriptionType } from '../../lib/types'
import { mockSubscriptions } from '../../lib/mock-data'
import { fetchAptSubscriptions } from '../../lib/api/cheongak'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const agency = searchParams.get('agency') ?? 'ALL'
  const type = searchParams.get('type') ?? 'ALL'
  const status = searchParams.get('status') ?? 'ALL'
  const region = searchParams.get('region') ?? 'ALL'

  let subscriptions: Subscription[]

  const apiKey = process.env.CHEONGAK_API_KEY

  if (apiKey) {
    try {
      subscriptions = await fetchAptSubscriptions(apiKey)
    } catch (error) {
      console.error('Failed to fetch from 청약홈 API, falling back to mock data:', error)
      subscriptions = mockSubscriptions
    }
  } else {
    subscriptions = mockSubscriptions
  }

  // Apply filters
  const filtered = subscriptions.filter((sub) => {
    if (agency !== 'ALL' && sub.agency !== (agency as Agency)) return false
    if (type !== 'ALL' && sub.type !== (type as SubscriptionType)) return false
    if (status !== 'ALL' && sub.status !== (status as SubscriptionStatus)) return false
    if (region !== 'ALL' && sub.location !== region) return false
    return true
  })

  return Response.json({
    subscriptions: filtered,
    total: filtered.length,
    lastUpdated: new Date().toISOString(),
  })
}
