import { cn, formatM2 } from '../lib/utils'

type Props = {
  pooledM2: number
  buildingCapacityM2: number
  className?: string
}

export function CollectionPoolMeter({
  pooledM2,
  buildingCapacityM2,
  className,
}: Props) {
  const ratio = Math.max(
    0,
    Math.min(1, pooledM2 / Math.max(buildingCapacityM2, 0.0001)),
  )
  const pct = ratio * 100
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Pooled so far</p>
          <p className="text-2xl font-semibold text-slate-900 tabular-nums">
            {formatM2(pooledM2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">Building capacity</p>
          <p className="text-2xl font-semibold text-slate-900 tabular-nums">
            {formatM2(buildingCapacityM2)}
          </p>
        </div>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">
        {pct < 80
          ? `${(buildingCapacityM2 - pooledM2).toFixed(2)}m² of shared capacity still available.`
          : pct < 100
            ? 'Pool nearly full — last few items welcome.'
            : 'Pool at capacity for this collection day.'}
      </p>
    </div>
  )
}
