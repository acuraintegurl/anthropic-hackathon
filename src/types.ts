export type Resident = {
  id: string
  name: string
  aptNumber: string
  email: string
  entitlementRemainingM2: number
  entitlementYear: string
}

export type ListingStatus = 'available' | 'claimed' | 'collected'

export type FurnitureListing = {
  id: string
  postedById: string
  title: string
  description: string
  photoUrl: string
  estimatedM2: number
  pickupBy: string
  status: ListingStatus
  claimedById?: string
  createdAt: string
}

export type EntitlementShareStatus = 'offered' | 'claimed'

export type EntitlementShare = {
  id: string
  offeredById: string
  m2Amount: number
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
  estimatedM2: number
}

export type Building = {
  id: string
  name: string
  address: string
  totalUnits: number
}
