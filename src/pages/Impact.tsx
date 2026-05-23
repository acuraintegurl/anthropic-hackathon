import { useState } from 'react'
import { Leaf, Recycle, Trophy, Wind } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { CATEGORY_SHORT, type ItemCategory } from '../types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/utils'

const CATEGORY_COLORS: Record<ItemCategory, string> = {
  furniture: 'bg-brand-500',
  whitegoods: 'bg-sky-500',
  ewaste: 'bg-amber-500',
  mattress: 'bg-rose-500',
}

const CATEGORY_TEXT: Record<ItemCategory, string> = {
  furniture: 'text-brand-700',
  whitegoods: 'text-sky-700',
  ewaste: 'text-amber-700',
  mattress: 'text-rose-700',
}

type CategoryFilter = ItemCategory | 'all'

export function Impact() {
  const { ecoMetrics, leaderboard, currentUser, building } = useAppData()
  const [filter, setFilter] = useState<CategoryFilter>('all')

  const maxMonthTotal = Math.max(
    1,
    ...ecoMetrics.monthlyByCategory.map((m) =>
      filter === 'all' ? m.totalKg : m.perCategoryKg[filter],
    ),
  )

  const filteredTotalKg =
    filter === 'all'
      ? ecoMetrics.totalKgDiverted
      : Math.round(ecoMetrics.byCategoryKg[filter])
  const filteredCo2 = Math.round(filteredTotalKg * 2.5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
          {building.name} impact
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          What the building has kept out of landfill — and who's been making it
          happen.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BigStat
          icon={<Recycle className="h-5 w-5" />}
          label="Diverted from landfill"
          value={`${filteredTotalKg.toLocaleString()} kg`}
          accent="bg-emerald-50 text-emerald-700"
        />
        <BigStat
          icon={<Wind className="h-5 w-5" />}
          label="Estimated CO₂ saved"
          value={`${filteredCo2.toLocaleString()} kg`}
          accent="bg-sky-50 text-sky-700"
        />
        <BigStat
          icon={<Leaf className="h-5 w-5" />}
          label="Across categories"
          value={`${Object.values(ecoMetrics.byCategoryKg).filter((v) => v > 0).length}/4`}
          accent="bg-brand-50 text-brand-700"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle>kg diverted, by month</CardTitle>
              <CardDescription>
                Last six months. Filter by category to drill in.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
              <FilterChip
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                All
              </FilterChip>
              {(Object.keys(CATEGORY_SHORT) as ItemCategory[]).map((c) => (
                <FilterChip
                  key={c}
                  active={filter === c}
                  onClick={() => setFilter(c)}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full inline-block mr-1.5',
                      CATEGORY_COLORS[c],
                    )}
                  />
                  {CATEGORY_SHORT[c]}
                </FilterChip>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-stretch gap-3 pt-2">
            {ecoMetrics.monthlyByCategory.map((m) => {
              const value = filter === 'all' ? m.totalKg : m.perCategoryKg[filter]
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center gap-2 min-w-0"
                >
                  <div className="w-full h-40 flex flex-col-reverse rounded-md overflow-hidden bg-slate-50">
                    {filter === 'all' ? (
                      (Object.keys(CATEGORY_SHORT) as ItemCategory[]).map(
                        (c) => {
                          const slice = m.perCategoryKg[c]
                          const slicePct = (slice / maxMonthTotal) * 100
                          if (slicePct <= 0) return null
                          return (
                            <div
                              key={c}
                              className={cn(CATEGORY_COLORS[c])}
                              style={{ height: `${slicePct}%` }}
                              title={`${CATEGORY_SHORT[c]}: ${slice} kg`}
                            />
                          )
                        },
                      )
                    ) : (
                      <div
                        className={cn(CATEGORY_COLORS[filter])}
                        style={{
                          height: `${Math.max(2, (value / maxMonthTotal) * 100)}%`,
                        }}
                        title={`${value} kg`}
                      />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 tabular-nums">
                    {m.month}
                  </div>
                  <div className="text-xs font-medium text-slate-700 tabular-nums">
                    {value.toLocaleString()} kg
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-3 pt-5 text-xs text-slate-600">
            {(Object.keys(CATEGORY_SHORT) as ItemCategory[]).map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5">
                <span
                  className={cn('h-2.5 w-2.5 rounded-sm', CATEGORY_COLORS[c])}
                />
                {CATEGORY_SHORT[c]} ·{' '}
                <span className="text-slate-500">
                  {Math.round(ecoMetrics.byCategoryKg[c]).toLocaleString()} kg
                </span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle>Building leaderboard</CardTitle>
              <CardDescription>
                Ranked by items diverted + m³ donated. Not a competition —
                everyone wins when the skip stays empty.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="space-y-1">
            {leaderboard.slice(0, 8).map((entry, idx) => {
              const isCurrent = entry.resident.id === currentUser?.id
              return (
                <li
                  key={entry.resident.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5',
                    isCurrent
                      ? 'bg-brand-50 border border-brand-100'
                      : 'hover:bg-slate-50',
                  )}
                >
                  <div
                    className={cn(
                      'h-7 w-7 grid place-items-center rounded-full text-xs font-semibold shrink-0 tabular-nums',
                      idx === 0
                        ? 'bg-amber-100 text-amber-700'
                        : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : idx === 2
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {idx + 1}
                  </div>
                  <div className="h-9 w-9 rounded-full bg-brand-600 text-white grid place-items-center text-xs font-semibold shrink-0">
                    {entry.resident.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium truncate',
                        isCurrent ? 'text-brand-900' : 'text-slate-900',
                      )}
                    >
                      {entry.resident.name}
                      {isCurrent && (
                        <span className="ml-2 text-xs font-normal text-brand-700">
                          (you)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {entry.resident.aptNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="tabular-nums">
                      {entry.itemsDiverted} item
                      {entry.itemsDiverted === 1 ? '' : 's'}
                    </Badge>
                    {entry.m3Donated > 0 && (
                      <Badge
                        variant="default"
                        className={cn('tabular-nums', CATEGORY_TEXT.furniture)}
                      >
                        {entry.m3Donated.toFixed(2)}m³ donated
                      </Badge>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

function BigStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            'h-12 w-12 rounded-xl grid place-items-center',
            accent,
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900 tabular-nums">
            {value}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap inline-flex items-center',
        active
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900',
      )}
    >
      {children}
    </button>
  )
}
