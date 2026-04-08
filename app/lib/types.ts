export type Agency = 'SH' | 'LH' | 'GH'
export type SubscriptionStatus = 'ongoing' | 'upcoming' | 'closed'
export type SubscriptionType = 'apt' | 'rental' | 'public-rental' | 'officetel'

export interface Subscription {
  id: string
  agency: Agency
  name: string           // 단지명
  type: SubscriptionType
  status: SubscriptionStatus
  location: string       // 시/도
  district: string       // 구/군
  totalUnits: number     // 총 세대수
  applicationStart: string  // ISO date string
  applicationEnd: string    // ISO date string
  announcementDate: string  // 당첨자 발표일
  moveInDate?: string       // 입주 예정일
  minPrice?: number         // 최저 분양가 (만원)
  maxPrice?: number         // 최고 분양가 (만원)
  url: string               // 상세 링크
  specialSupply?: {
    multiChild?: number     // 다자녀
    newlywed?: number       // 신혼부부
    firstHome?: number      // 생애최초
    old?: number            // 노부모부양
  }
}

export interface SubscriptionFilters {
  agency: Agency | 'ALL'
  type: SubscriptionType | 'ALL'
  status: SubscriptionStatus | 'ALL'
  region: string | 'ALL'
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[]
  total: number
  lastUpdated: string
}
