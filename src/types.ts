export type Resident = {
  id: string
  name: string
  aptNumber: string
  email: string
  entitlementRemainingM3: number
  entitlementYear: string
}

export type ItemCategory = 'furniture' | 'whitegoods' | 'ewaste' | 'mattress'

export type ListingStatus = 'available' | 'reserved' | 'claimed' | 'collected'

export type FurnitureListing = {
  id: string
  postedById: string
  title: string
  description: string
  photoUrl: string
  category: ItemCategory
  estimatedM3: number
  pickupBy: string
  status: ListingStatus
  claimedById?: string
  reservedById?: string
  reservedUntil?: string
  createdAt: string
}

export type EntitlementShareStatus = 'offered' | 'claimed'

export type EntitlementShare = {
  id: string
  offeredById: string
  m3Amount: number
  note?: string
  status: EntitlementShareStatus
  claimedById?: string
  createdAt: string
}

export type CollectionDayStatus = 'planned' | 'locked' | 'completed'

export type CollectionDay = {
  id: string
  scheduledDate: string
  organizerId: string
  status: CollectionDayStatus
}

export type CollectionItem = {
  id: string
  collectionDayId: string
  residentId: string
  title: string
  category: ItemCategory
  estimatedM3: number
}

export type Building = {
  id: string
  name: string
  address: string
  totalUnits: number
  joinCode: string
}

export type NotificationPrefs = Record<ItemCategory, boolean>

export type NotificationKind =
  | 'new_listing'
  | 'reservation_expiring'
  | 'item_claimed'
  | 'share_offered'
  | 'collection_reminder'

export type AppNotification = {
  id: string
  kind: NotificationKind
  category?: ItemCategory
  title: string
  body: string
  createdAt: string
  href?: string
}

export type BadgeKey =
  | 'first_listing'
  | 'first_claim'
  | 'first_donor'
  | 'pool_contributor'
  | 'streak'

export type BadgeDef = {
  key: BadgeKey
  label: string
  description: string
}

export const BADGE_CATALOG: BadgeDef[] = [
  {
    key: 'first_listing',
    label: 'First post',
    description: 'Listed your first give-away.',
  },
  {
    key: 'first_claim',
    label: 'First claim',
    description: 'Claimed something from a neighbour.',
  },
  {
    key: 'first_donor',
    label: 'First donor',
    description: 'Offered some of your m³ to the building.',
  },
  {
    key: 'pool_contributor',
    label: 'Pool contributor',
    description: 'Added an item to the next collection day.',
  },
  {
    key: 'streak',
    label: 'Repeat sharer',
    description: 'Three or more give-aways posted or claimed.',
  },
]

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  furniture: 'Household furniture',
  whitegoods: 'White goods',
  ewaste: 'E-waste',
  mattress: 'Mattress',
}

export const CATEGORY_SHORT: Record<ItemCategory, string> = {
  furniture: 'Furniture',
  whitegoods: 'White goods',
  ewaste: 'E-waste',
  mattress: 'Mattress',
}

// Rough kg-per-m³ density per category for the eco footprint estimate.
export const CATEGORY_KG_PER_M3: Record<ItemCategory, number> = {
  furniture: 120,
  whitegoods: 250,
  ewaste: 180,
  mattress: 80,
}

// CO₂ saved per kg of household waste diverted from landfill (rough EPA figure).
export const CO2_KG_PER_KG_DIVERTED = 2.5
