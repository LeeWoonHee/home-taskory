import type { Subscription, Agency, SubscriptionStatus, SubscriptionType } from '../types'

// Base URL for 청약홈 API (한국부동산원)
const BASE_URL = 'http://openapi.reb.or.kr/OpenAPI_ToolInstallPackage/service/rest'

interface RawAptItem {
  HOUSE_NM?: string
  BSNS_MBY_NM?: string
  HSSPLY_ADRES?: string
  TOT_SUPLY_HSHLDCO?: string
  RCRIT_PBLANC_DE?: string
  SUBSCRPT_AREA_CODE_NM?: string
  RCEPT_BGNDE?: string
  RCEPT_ENDDE?: string
  PRZWNER_PRESNATN_DE?: string
  MOVE_IN_DE?: string
  LTTOT_TOP_AMOUNT?: string
  LTTOT_LWST_AMOUNT?: string
  PARCPRC_ULS_AT?: string
  SPSPLY_HSHLDCO?: string
  NWWDS_HSHLDCO?: string
  FIRST_LTTOT_HSHLDCO?: string
  ELDLY_PARNTS_SUPORT_HSHLDCO?: string
  PBLANC_NO?: string
}

function detectAgency(businessName: string): Agency {
  const name = businessName.toUpperCase()
  if (name.includes('SH') || name.includes('서울주택') || name.includes('서울시')) {
    return 'SH'
  }
  if (name.includes('GH') || name.includes('경기주택') || name.includes('경기도시')) {
    return 'GH'
  }
  return 'LH'
}

function detectStatus(startDate: string, endDate: string): SubscriptionStatus {
  const today = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (today < start) return 'upcoming'
  if (today > end) return 'closed'
  return 'ongoing'
}

function formatDateString(raw: string | undefined): string {
  if (!raw || raw.length < 8) return new Date().toISOString().split('T')[0]
  // Input format: YYYYMMDD
  const year = raw.slice(0, 4)
  const month = raw.slice(4, 6)
  const day = raw.slice(6, 8)
  return `${year}-${month}-${day}`
}

function parseLocation(address: string | undefined): { location: string; district: string } {
  if (!address) return { location: '기타', district: '기타' }
  const parts = address.trim().split(' ')
  return {
    location: parts[0] ?? '기타',
    district: parts[1] ?? '기타',
  }
}

function mapApiResponseToSubscription(item: RawAptItem): Subscription {
  const name = item.HOUSE_NM ?? '이름 없음'
  const businessName = item.BSNS_MBY_NM ?? ''
  const agency = detectAgency(businessName)

  const applicationStart = formatDateString(item.RCEPT_BGNDE)
  const applicationEnd = formatDateString(item.RCEPT_ENDDE)
  const status = detectStatus(applicationStart, applicationEnd)

  const { location, district } = parseLocation(item.HSSPLY_ADRES)
  const totalUnits = parseInt(item.TOT_SUPLY_HSHLDCO ?? '0', 10) || 0

  const minPrice = item.LTTOT_LWST_AMOUNT
    ? Math.round(parseInt(item.LTTOT_LWST_AMOUNT, 10) / 10000)
    : undefined
  const maxPrice = item.LTTOT_TOP_AMOUNT
    ? Math.round(parseInt(item.LTTOT_TOP_AMOUNT, 10) / 10000)
    : undefined

  const multiChild = item.PARCPRC_ULS_AT
    ? parseInt(item.PARCPRC_ULS_AT, 10)
    : undefined
  const newlywed = item.NWWDS_HSHLDCO
    ? parseInt(item.NWWDS_HSHLDCO, 10)
    : undefined
  const firstHome = item.FIRST_LTTOT_HSHLDCO
    ? parseInt(item.FIRST_LTTOT_HSHLDCO, 10)
    : undefined
  const old = item.ELDLY_PARNTS_SUPORT_HSHLDCO
    ? parseInt(item.ELDLY_PARNTS_SUPORT_HSHLDCO, 10)
    : undefined

  const hasSpecialSupply =
    multiChild !== undefined ||
    newlywed !== undefined ||
    firstHome !== undefined ||
    old !== undefined

  return {
    id: item.PBLANC_NO ?? `lh-${Date.now()}-${Math.random()}`,
    agency,
    name,
    type: 'apt' as SubscriptionType,
    status,
    location,
    district,
    totalUnits,
    applicationStart,
    applicationEnd,
    announcementDate: formatDateString(item.PRZWNER_PRESNATN_DE),
    moveInDate: item.MOVE_IN_DE ? formatDateString(item.MOVE_IN_DE) : undefined,
    minPrice,
    maxPrice,
    url: `https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=${item.PBLANC_NO ?? ''}&pblancNo=${item.PBLANC_NO ?? ''}`,
    specialSupply: hasSpecialSupply
      ? { multiChild, newlywed, firstHome, old }
      : undefined,
  }
}

function parseXml(xmlText: string): RawAptItem[] {
  const items: RawAptItem[] = []

  // Simple XML parsing without external dependencies
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g)
  if (!itemMatches) return items

  const fieldKeys: (keyof RawAptItem)[] = [
    'HOUSE_NM', 'BSNS_MBY_NM', 'HSSPLY_ADRES', 'TOT_SUPLY_HSHLDCO',
    'RCRIT_PBLANC_DE', 'SUBSCRPT_AREA_CODE_NM', 'RCEPT_BGNDE', 'RCEPT_ENDDE',
    'PRZWNER_PRESNATN_DE', 'MOVE_IN_DE', 'LTTOT_TOP_AMOUNT', 'LTTOT_LWST_AMOUNT',
    'PARCPRC_ULS_AT', 'NWWDS_HSHLDCO', 'FIRST_LTTOT_HSHLDCO',
    'ELDLY_PARNTS_SUPORT_HSHLDCO', 'PBLANC_NO',
  ]

  for (const itemXml of itemMatches) {
    const item: RawAptItem = {}
    for (const key of fieldKeys) {
      const match = itemXml.match(new RegExp(`<${key}>([^<]*)<\/${key}>`))
      if (match?.[1]) {
        item[key] = match[1].trim()
      }
    }
    items.push(item)
  }

  return items
}

export async function fetchAptSubscriptions(serviceKey: string): Promise<Subscription[]> {
  const params = new URLSearchParams({
    serviceKey,
    pageNo: '1',
    numOfRows: '100',
    _type: 'xml',
  })

  const url = `${BASE_URL}/getLttotPblancList?${params.toString()}`

  const response = await fetch(url, {
    headers: { Accept: 'application/xml' },
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const xmlText = await response.text()
  const rawItems = parseXml(xmlText)

  return rawItems.map(mapApiResponseToSubscription)
}
