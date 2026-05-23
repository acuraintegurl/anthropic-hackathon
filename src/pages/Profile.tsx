import { Link } from 'react-router-dom'
import { Award, Lock, Mail } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { BADGE_CATALOG } from '../types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EntitlementBar } from '../components/EntitlementBar'
import { cn, formatDateShort, formatM3 } from '../lib/utils'

export function Profile() {
  const {
    currentUser,
    listings,
    shares,
    collectionItems,
    getResident,
    badgesFor,
  } = useAppData()

  if (!currentUser) return null

  const myListings = listings.filter((l) => l.postedById === currentUser.id)
  const sharesOffered = shares.filter((s) => s.offeredById === currentUser.id)
  const sharesReceived = shares.filter(
    (s) => s.status === 'claimed' && s.claimedById === currentUser.id,
  )
  const myPoolItems = collectionItems.filter(
    (ci) => ci.residentId === currentUser.id,
  )
  const myPooledM3 = myPoolItems.reduce((sum, i) => sum + i.estimatedM3, 0)
  const earnedBadges = badgesFor(currentUser.id)

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-brand-600 text-white grid place-items-center text-xl font-semibold">
            {currentUser.name
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-slate-900">
              {currentUser.name}
            </h1>
            <p className="text-sm text-slate-500">
              {currentUser.aptNumber} · {currentUser.entitlementYear}
            </p>
            <p className="text-sm text-slate-500 inline-flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" /> {currentUser.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your hard-waste entitlement</CardTitle>
          <CardDescription>
            Includes any m³ received from neighbours and minus anything you've
            offered or pooled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntitlementBar
            remaining={currentUser.entitlementRemainingM3}
            capacity={1}
          />
          <div className="grid grid-cols-3 gap-3 mt-5 text-center">
            <Stat label="m³ in pool" value={formatM3(myPooledM3)} />
            <Stat
              label="m³ received"
              value={formatM3(
                sharesReceived.reduce((s, x) => s + x.m3Amount, 0),
              )}
            />
            <Stat
              label="m³ gifted"
              value={formatM3(
                sharesOffered.reduce((s, x) => s + x.m3Amount, 0),
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle>Badges</CardTitle>
              <CardDescription>
                Earned {earnedBadges.size} of {BADGE_CATALOG.length}.
              </CardDescription>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGE_CATALOG.map((b) => {
              const earned = earnedBadges.has(b.key)
              return (
                <li
                  key={b.key}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3',
                    earned
                      ? 'bg-amber-50 border-amber-100'
                      : 'bg-slate-50 border-slate-100',
                  )}
                >
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full grid place-items-center shrink-0',
                      earned
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-slate-200 text-slate-400',
                    )}
                  >
                    {earned ? (
                      <Award className="h-5 w-5" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        earned ? 'text-amber-900' : 'text-slate-500',
                      )}
                    >
                      {b.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your give-away listings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myListings.length === 0 ? (
            <p className="text-sm text-slate-500">
              You haven't posted any items yet.{' '}
              <Link to="/listings/new" className="text-brand-700 font-medium hover:underline">
                Post one now →
              </Link>
            </p>
          ) : (
            myListings.map((l) => {
              const claimer = getResident(l.claimedById)
              return (
                <Link
                  key={l.id}
                  to={`/listings/${l.id}`}
                  className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-slate-50"
                >
                  <img
                    src={l.photoUrl}
                    alt=""
                    className="h-12 w-16 object-cover rounded-md bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {l.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Posted {formatDateShort(l.createdAt)}
                      {claimer && ` · Claimed by ${claimer.name}`}
                    </p>
                  </div>
                  {l.status === 'available' && (
                    <Badge variant="success">Available</Badge>
                  )}
                  {l.status === 'reserved' && (
                    <Badge variant="warning">Reserved</Badge>
                  )}
                  {l.status === 'claimed' && (
                    <Badge variant="warning">Claimed</Badge>
                  )}
                  {l.status === 'collected' && (
                    <Badge variant="neutral">Collected</Badge>
                  )}
                </Link>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your items in the collection pool</CardTitle>
        </CardHeader>
        <CardContent>
          {myPoolItems.length === 0 ? (
            <p className="text-sm text-slate-500">
              You haven't added anything to the next collection day.{' '}
              <Link
                to="/collection-day"
                className="text-brand-700 font-medium hover:underline"
              >
                Add an item →
              </Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {myPoolItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-700">{item.title}</span>
                  <span className="text-slate-500 tabular-nums">
                    {formatM3(item.estimatedM3)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
      <p className="text-lg font-semibold text-slate-900 tabular-nums">
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}
