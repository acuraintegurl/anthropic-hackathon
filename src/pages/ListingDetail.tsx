import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Ruler, User } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { CATEGORY_LABEL } from '../types'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card'
import { formatDate, formatM3 } from '../lib/utils'

function hoursLeft(iso: string | undefined): number | null {
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60)))
}

export function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    listings,
    currentUser,
    getResident,
    reserveListing,
    releaseReservation,
    confirmCollected,
    withdrawListing,
  } = useAppData()

  const listing = listings.find((l) => l.id === id)
  if (!listing) return <Navigate to="/marketplace" replace />

  const poster = getResident(listing.postedById)
  const reserver = getResident(listing.reservedById)
  const claimer = getResident(listing.claimedById)
  const isMine = currentUser?.id === listing.postedById
  const isReserver = currentUser?.id === listing.reservedById
  const canReserve = !isMine && listing.status === 'available'
  const holdHours = hoursLeft(listing.reservedUntil)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to give-aways
      </Link>

      <Card className="overflow-hidden">
        <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
          <img
            src={listing.photoUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-xl">{listing.title}</CardTitle>
            {listing.status === 'available' && (
              <Badge variant="success">Available</Badge>
            )}
            {listing.status === 'reserved' && (
              <Badge variant="warning">Reserved · 24h hold</Badge>
            )}
            {listing.status === 'claimed' && (
              <Badge variant="warning">Claimed</Badge>
            )}
            {listing.status === 'collected' && (
              <Badge variant="neutral">Collected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4 text-slate-400" />
              From {poster?.name} ({poster?.aptNumber})
            </span>
            <Badge variant="outline">{CATEGORY_LABEL[listing.category]}</Badge>
            <span className="inline-flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-slate-400" />
              {formatM3(listing.estimatedM3)} footprint
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              Available until {formatDate(listing.pickupBy)}
            </span>
          </div>

          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {listing.description}
          </p>

          {listing.status === 'reserved' && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900 flex items-start gap-2.5">
              <Clock className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                {isReserver
                  ? 'You have this on a 24-hour hold.'
                  : `Reserved by ${reserver?.name ?? 'a neighbour'} (${reserver?.aptNumber ?? ''}).`}{' '}
                {holdHours !== null && (
                  <span className="text-amber-800/80">
                    Hold expires in ~{holdHours}h. If not collected, it'll
                    auto-release.
                  </span>
                )}
              </div>
            </div>
          )}

          {listing.status === 'claimed' && claimer && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900">
              Claimed by {claimer.name} ({claimer.aptNumber}). They'll be in
              touch about pickup.
            </div>
          )}

          {listing.status === 'collected' && claimer && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-900">
              Collected by {claimer.name} ({claimer.aptNumber}) — kept out of
              landfill.
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {canReserve && (
              <Button onClick={() => reserveListing(listing.id)}>
                Reserve · 24h hold
              </Button>
            )}
            {isReserver && listing.status === 'reserved' && (
              <>
                <Button onClick={() => confirmCollected(listing.id)}>
                  Confirm collected
                </Button>
                <Button
                  variant="outline"
                  onClick={() => releaseReservation(listing.id)}
                >
                  Release hold
                </Button>
              </>
            )}
            {isMine && listing.status === 'available' && (
              <Button
                variant="outline"
                onClick={() => {
                  withdrawListing(listing.id)
                  navigate('/marketplace')
                }}
              >
                Withdraw listing
              </Button>
            )}
            {isMine && listing.status === 'claimed' && (
              <Button onClick={() => confirmCollected(listing.id)}>
                Mark as collected
              </Button>
            )}
            {!isMine &&
              !isReserver &&
              listing.status !== 'available' &&
              listing.status !== 'reserved' && (
                <p className="text-sm text-slate-500">
                  This item is no longer available.
                </p>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
