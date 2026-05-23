import { useMemo, useState, type FormEvent } from 'react'
import { CalendarDays, Trash2, UserCog } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Badge } from '../components/ui/Badge'
import { CollectionPoolMeter } from '../components/CollectionPoolMeter'
import { EntitlementBar } from '../components/EntitlementBar'
import { daysUntil, formatDate, formatM2 } from '../lib/utils'

export function CollectionDay() {
  const {
    collectionDay,
    collectionItems,
    currentUser,
    residents,
    building,
    getResident,
    addCollectionItem,
    removeCollectionItem,
  } = useAppData()

  const [title, setTitle] = useState('')
  const [size, setSize] = useState('0.25')
  const [error, setError] = useState<string | null>(null)

  if (!currentUser) return null

  const pooledM2 = useMemo(
    () => collectionItems.reduce((sum, ci) => sum + ci.estimatedM2, 0),
    [collectionItems],
  )

  const buildingCapacity = useMemo(
    () =>
      residents.reduce((sum, r) => sum + r.entitlementRemainingM2, 0) +
      pooledM2,
    [residents, pooledM2],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, typeof collectionItems>()
    for (const item of collectionItems) {
      const arr = map.get(item.residentId) ?? []
      arr.push(item)
      map.set(item.residentId, arr)
    }
    return Array.from(map.entries())
  }, [collectionItems])

  const organizer = getResident(collectionDay.organizerId)
  const days = daysUntil(collectionDay.scheduledDate)

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const sizeNum = parseFloat(size)
    if (isNaN(sizeNum) || sizeNum <= 0) {
      setError('Pick an amount greater than 0.')
      return
    }
    if (sizeNum > currentUser.entitlementRemainingM2) {
      setError(
        `You only have ${formatM2(currentUser.entitlementRemainingM2)} of entitlement left.`,
      )
      return
    }
    const ok = addCollectionItem({
      title: title.trim() || 'Hard waste item',
      estimatedM2: sizeNum,
    })
    if (ok) {
      setTitle('')
      setSize('0.25')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Building collection day
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pool your items against the building's combined entitlement —
          everyone gets their stuff to the curb, nothing dumped illegally.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-brand-50 to-white">
        <CardHeader className="border-b-brand-100">
          <div className="flex items-start gap-4 justify-between flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-brand-700">
                <CalendarDays className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Next pickup
                </p>
              </div>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {formatDate(collectionDay.scheduledDate)}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {days > 0 ? `${days} days away` : days === 0 ? 'Today' : 'Past'}
              </p>
            </div>
            <Badge variant="default" className="text-sm">
              <UserCog className="h-3.5 w-3.5" /> Organised by {organizer?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CollectionPoolMeter
            pooledM2={pooledM2}
            buildingCapacityM2={buildingCapacity}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>What's in the pool</CardTitle>
            <CardDescription>
              {collectionItems.length} item{collectionItems.length === 1 ? '' : 's'}{' '}
              across {grouped.length} resident{grouped.length === 1 ? '' : 's'}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {grouped.length === 0 && (
              <p className="text-sm text-slate-500">
                Nothing pooled yet — be the first.
              </p>
            )}
            {grouped.map(([residentId, items]) => {
              const r = getResident(residentId)
              const subtotal = items.reduce(
                (sum, i) => sum + i.estimatedM2,
                0,
              )
              const isMe = residentId === currentUser.id
              return (
                <div key={residentId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 grid place-items-center text-xs font-semibold">
                        {r?.name
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {r?.name}{' '}
                        <span className="text-slate-400 font-normal">
                          · {r?.aptNumber}
                        </span>
                        {isMe && (
                          <Badge variant="default" className="ml-2">
                            You
                          </Badge>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {formatM2(subtotal)}
                    </span>
                  </div>
                  <ul className="space-y-1.5 pl-9">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="text-slate-700">{item.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 tabular-nums">
                            {formatM2(item.estimatedM2)}
                          </span>
                          {isMe && (
                            <button
                              onClick={() => removeCollectionItem(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add your item</CardTitle>
            <CardDescription>
              Deducts from your personal entitlement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <EntitlementBar
              remaining={currentUser.entitlementRemainingM2}
              capacity={1}
              label="Your remaining m²"
            />
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="item-title">What is it?</Label>
                <Input
                  id="item-title"
                  placeholder="e.g. Broken desk chair"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="item-size">Size (m²)</Label>
                <Input
                  id="item-size"
                  type="number"
                  step="0.05"
                  min="0.05"
                  max={currentUser.entitlementRemainingM2}
                  required
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={currentUser.entitlementRemainingM2 <= 0}
              >
                Add to the pool
              </Button>
              {currentUser.entitlementRemainingM2 <= 0 && (
                <p className="text-xs text-slate-500 text-center">
                  Out of entitlement — claim some m² from a neighbour first.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-700">How the pool works.</strong> Each
          of the {building.totalUnits} apartments at {building.name} gets a
          1m² hard-waste entitlement per financial year. By pooling against
          one shared collection day, items get to the curb properly — no
          illegal dumping, no wasted entitlements.
        </CardContent>
      </Card>
    </div>
  )
}
