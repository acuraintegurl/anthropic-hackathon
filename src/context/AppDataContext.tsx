import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppNotification,
  BadgeKey,
  CollectionDay,
  CollectionItem,
  EntitlementShare,
  FurnitureListing,
  ItemCategory,
  NotificationPrefs,
  Resident,
} from '../types'
import { CATEGORY_KG_PER_M3, CO2_KG_PER_KG_DIVERTED } from '../types'
import {
  BUILDING,
  COLLECTION_DAY,
  COLLECTION_ITEMS,
  DEFAULT_NOTIFICATION_PREFS,
  LISTINGS,
  NOTIFICATIONS,
  RESIDENTS,
  SHARES,
} from '../lib/seed'
import { uid } from '../lib/utils'
import { useAuth } from './AuthContext'

type NewListingInput = {
  title: string
  description: string
  photoUrl: string
  category: ItemCategory
  estimatedM3: number
  pickupBy: string
}

type NewCollectionItemInput = {
  title: string
  category: ItemCategory
  estimatedM3: number
}

export type LeaderboardEntry = {
  resident: Resident
  itemsDiverted: number
  m3Donated: number
  score: number
}

export type EcoMetrics = {
  totalKgDiverted: number
  totalCo2Kg: number
  byCategoryKg: Record<ItemCategory, number>
  monthlyByCategory: {
    month: string
    perCategoryKg: Record<ItemCategory, number>
    totalKg: number
  }[]
}

type AppData = {
  building: typeof BUILDING
  residents: Resident[]
  listings: FurnitureListing[]
  shares: EntitlementShare[]
  collectionDay: CollectionDay
  collectionItems: CollectionItem[]
  notifications: AppNotification[]
  notificationPrefs: NotificationPrefs
  currentUser: Resident | null

  getResident: (id: string | undefined) => Resident | undefined

  createListing: (input: NewListingInput) => string | null
  reserveListing: (id: string) => void
  releaseReservation: (id: string) => void
  confirmCollected: (id: string) => void
  claimListing: (id: string) => void
  withdrawListing: (id: string) => void

  offerShare: (m3: number, note?: string) => boolean
  claimShare: (id: string) => void

  addCollectionItem: (input: NewCollectionItemInput) => boolean
  removeCollectionItem: (id: string) => void

  toggleNotificationPref: (category: ItemCategory) => void

  ecoMetrics: EcoMetrics
  leaderboard: LeaderboardEntry[]
  badgesFor: (residentId: string) => Set<BadgeKey>
}

const AppDataContext = createContext<AppData | null>(null)

const RESERVATION_HOLD_HOURS = 24

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { currentUserId } = useAuth()
  const [residents, setResidents] = useState<Resident[]>(RESIDENTS)
  const [listings, setListings] = useState<FurnitureListing[]>(LISTINGS)
  const [shares, setShares] = useState<EntitlementShare[]>(SHARES)
  const [collectionDay] = useState<CollectionDay>(COLLECTION_DAY)
  const [collectionItems, setCollectionItems] =
    useState<CollectionItem[]>(COLLECTION_ITEMS)
  const [notifications] = useState<AppNotification[]>(NOTIFICATIONS)
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(
    DEFAULT_NOTIFICATION_PREFS,
  )

  const currentUser = useMemo(
    () => residents.find((r) => r.id === currentUserId) ?? null,
    [residents, currentUserId],
  )

  const getResident = useCallback(
    (id: string | undefined) => residents.find((r) => r.id === id),
    [residents],
  )

  const adjustEntitlement = useCallback(
    (residentId: string, delta: number) => {
      setResidents((prev) =>
        prev.map((r) =>
          r.id === residentId
            ? {
                ...r,
                entitlementRemainingM3: Math.max(
                  0,
                  Math.round((r.entitlementRemainingM3 + delta) * 100) / 100,
                ),
              }
            : r,
        ),
      )
    },
    [],
  )

  const createListing = useCallback(
    (input: NewListingInput): string | null => {
      if (!currentUserId) return null
      const id = uid('l')
      const listing: FurnitureListing = {
        id,
        postedById: currentUserId,
        status: 'available',
        createdAt: new Date().toISOString(),
        ...input,
      }
      setListings((prev) => [listing, ...prev])
      return id
    },
    [currentUserId],
  )

  const reserveListing = useCallback(
    (id: string) => {
      if (!currentUserId) return
      const reservedUntil = new Date(
        Date.now() + RESERVATION_HOLD_HOURS * 60 * 60 * 1000,
      ).toISOString()
      setListings((prev) =>
        prev.map((l) =>
          l.id === id &&
          l.status === 'available' &&
          l.postedById !== currentUserId
            ? {
                ...l,
                status: 'reserved',
                reservedById: currentUserId,
                reservedUntil,
              }
            : l,
        ),
      )
    },
    [currentUserId],
  )

  const releaseReservation = useCallback(
    (id: string) => {
      if (!currentUserId) return
      setListings((prev) =>
        prev.map((l) =>
          l.id === id &&
          l.status === 'reserved' &&
          l.reservedById === currentUserId
            ? {
                ...l,
                status: 'available',
                reservedById: undefined,
                reservedUntil: undefined,
              }
            : l,
        ),
      )
    },
    [currentUserId],
  )

  const confirmCollected = useCallback(
    (id: string) => {
      if (!currentUserId) return
      setListings((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l
          // The reserver finalises into collected.
          if (l.status === 'reserved' && l.reservedById === currentUserId) {
            return {
              ...l,
              status: 'collected',
              claimedById: currentUserId,
              reservedById: undefined,
              reservedUntil: undefined,
            }
          }
          // Poster can mark their own claimed listing as collected.
          if (l.status === 'claimed' && l.postedById === currentUserId) {
            return { ...l, status: 'collected' }
          }
          return l
        }),
      )
    },
    [currentUserId],
  )

  const claimListing = useCallback(
    (id: string) => {
      if (!currentUserId) return
      setListings((prev) =>
        prev.map((l) =>
          l.id === id &&
          l.status === 'available' &&
          l.postedById !== currentUserId
            ? { ...l, status: 'claimed', claimedById: currentUserId }
            : l,
        ),
      )
    },
    [currentUserId],
  )

  const withdrawListing = useCallback(
    (id: string) => {
      if (!currentUserId) return
      setListings((prev) =>
        prev.filter((l) => !(l.id === id && l.postedById === currentUserId)),
      )
    },
    [currentUserId],
  )

  const offerShare = useCallback(
    (m3: number, note?: string): boolean => {
      if (!currentUserId) return false
      if (!currentUser || currentUser.entitlementRemainingM3 < m3) return false
      const share: EntitlementShare = {
        id: uid('s'),
        offeredById: currentUserId,
        m3Amount: m3,
        note,
        status: 'offered',
        createdAt: new Date().toISOString(),
      }
      setShares((prev) => [share, ...prev])
      adjustEntitlement(currentUserId, -m3)
      return true
    },
    [currentUserId, currentUser, adjustEntitlement],
  )

  const claimShare = useCallback(
    (id: string) => {
      if (!currentUserId) return
      const share = shares.find((s) => s.id === id)
      if (!share || share.status !== 'offered') return
      if (share.offeredById === currentUserId) return
      setShares((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: 'claimed', claimedById: currentUserId } : s,
        ),
      )
      adjustEntitlement(currentUserId, share.m3Amount)
    },
    [currentUserId, shares, adjustEntitlement],
  )

  const addCollectionItem = useCallback(
    (input: NewCollectionItemInput): boolean => {
      if (!currentUserId) return false
      if (!currentUser || currentUser.entitlementRemainingM3 < input.estimatedM3)
        return false
      const item: CollectionItem = {
        id: uid('ci'),
        collectionDayId: collectionDay.id,
        residentId: currentUserId,
        title: input.title,
        category: input.category,
        estimatedM3: input.estimatedM3,
      }
      setCollectionItems((prev) => [...prev, item])
      adjustEntitlement(currentUserId, -input.estimatedM3)
      return true
    },
    [currentUserId, currentUser, collectionDay.id, adjustEntitlement],
  )

  const removeCollectionItem = useCallback(
    (id: string) => {
      if (!currentUserId) return
      const item = collectionItems.find((c) => c.id === id)
      if (!item || item.residentId !== currentUserId) return
      setCollectionItems((prev) => prev.filter((c) => c.id !== id))
      adjustEntitlement(currentUserId, item.estimatedM3)
    },
    [currentUserId, collectionItems, adjustEntitlement],
  )

  const toggleNotificationPref = useCallback((category: ItemCategory) => {
    setNotificationPrefs((prev) => ({ ...prev, [category]: !prev[category] }))
  }, [])

  const ecoMetrics: EcoMetrics = useMemo(() => {
    const byCategoryKg: Record<ItemCategory, number> = {
      furniture: 0,
      whitegoods: 0,
      ewaste: 0,
      mattress: 0,
    }

    // Listings that found a new home (claimed or collected) count as diverted.
    const divertedListings = listings.filter(
      (l) => l.status === 'claimed' || l.status === 'collected',
    )
    for (const l of divertedListings) {
      byCategoryKg[l.category] += l.estimatedM3 * CATEGORY_KG_PER_M3[l.category]
    }
    // Pooled items also count — they're going through legal collection rather than dumping.
    for (const ci of collectionItems) {
      byCategoryKg[ci.category] +=
        ci.estimatedM3 * CATEGORY_KG_PER_M3[ci.category]
    }

    const totalKgDiverted = Math.round(
      Object.values(byCategoryKg).reduce((s, v) => s + v, 0),
    )
    const totalCo2Kg = Math.round(totalKgDiverted * CO2_KG_PER_KG_DIVERTED)

    // Synthesised 6-month trend for the chart — distributes weight across recent months.
    const now = new Date()
    const monthlyByCategory = Array.from({ length: 6 }).map((_, idx) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1)
      const monthLabel = monthDate.toLocaleDateString('en-AU', { month: 'short' })
      // Weight: small ramp so the latest month dominates.
      const weight = 0.05 + idx * 0.04
      const perCategoryKg: Record<ItemCategory, number> = {
        furniture: Math.round(byCategoryKg.furniture * weight),
        whitegoods: Math.round(byCategoryKg.whitegoods * weight),
        ewaste: Math.round(byCategoryKg.ewaste * weight),
        mattress: Math.round(byCategoryKg.mattress * weight),
      }
      return {
        month: monthLabel,
        perCategoryKg,
        totalKg: Object.values(perCategoryKg).reduce((s, v) => s + v, 0),
      }
    })

    return { totalKgDiverted, totalCo2Kg, byCategoryKg, monthlyByCategory }
  }, [listings, collectionItems])

  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    const entries = residents.map((r) => {
      const postedDiverted = listings.filter(
        (l) =>
          l.postedById === r.id &&
          (l.status === 'claimed' || l.status === 'collected'),
      ).length
      const claimed = listings.filter(
        (l) =>
          (l.status === 'claimed' || l.status === 'collected') &&
          l.claimedById === r.id,
      ).length
      const pooled = collectionItems.filter((ci) => ci.residentId === r.id).length
      const itemsDiverted = postedDiverted + claimed + pooled
      const m3Donated = shares
        .filter((s) => s.offeredById === r.id)
        .reduce((sum, s) => sum + s.m3Amount, 0)
      // Simple combined score for ranking.
      const score = itemsDiverted * 2 + m3Donated * 4
      return { resident: r, itemsDiverted, m3Donated, score }
    })
    return entries.sort((a, b) => b.score - a.score)
  }, [residents, listings, collectionItems, shares])

  const badgesFor = useCallback(
    (residentId: string): Set<BadgeKey> => {
      const earned = new Set<BadgeKey>()
      const posted = listings.filter((l) => l.postedById === residentId)
      const claimed = listings.filter(
        (l) =>
          (l.status === 'claimed' || l.status === 'collected') &&
          l.claimedById === residentId,
      )
      const offered = shares.filter((s) => s.offeredById === residentId)
      const pooled = collectionItems.filter((ci) => ci.residentId === residentId)

      if (posted.length >= 1) earned.add('first_listing')
      if (claimed.length >= 1) earned.add('first_claim')
      if (offered.length >= 1) earned.add('first_donor')
      if (pooled.length >= 1) earned.add('pool_contributor')
      if (posted.length + claimed.length >= 3) earned.add('streak')

      return earned
    },
    [listings, shares, collectionItems],
  )

  const value: AppData = {
    building: BUILDING,
    residents,
    listings,
    shares,
    collectionDay,
    collectionItems,
    notifications,
    notificationPrefs,
    currentUser,
    getResident,
    createListing,
    reserveListing,
    releaseReservation,
    confirmCollected,
    claimListing,
    withdrawListing,
    offerShare,
    claimShare,
    addCollectionItem,
    removeCollectionItem,
    toggleNotificationPref,
    ecoMetrics,
    leaderboard,
    badgesFor,
  }

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  )
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
