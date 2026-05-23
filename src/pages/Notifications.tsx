import { Link } from 'react-router-dom'
import {
  Bell,
  BellOff,
  CalendarDays,
  Clock,
  PackageCheck,
  Share2,
  Sparkles,
} from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import {
  CATEGORY_SHORT,
  type AppNotification,
  type ItemCategory,
  type NotificationKind,
} from '../types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { cn, formatDateShort } from '../lib/utils'

const KIND_ICON: Record<NotificationKind, React.ReactNode> = {
  new_listing: <Sparkles className="h-4 w-4" />,
  reservation_expiring: <Clock className="h-4 w-4" />,
  item_claimed: <PackageCheck className="h-4 w-4" />,
  share_offered: <Share2 className="h-4 w-4" />,
  collection_reminder: <CalendarDays className="h-4 w-4" />,
}

export function Notifications() {
  const { notifications, notificationPrefs, toggleNotificationPref } =
    useAppData()

  const enabledCount = Object.values(notificationPrefs).filter(Boolean).length
  const totalCategories = Object.keys(notificationPrefs).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
          Notifications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quiet by default. You only hear about categories you opt into — no
          building-wide noise.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                {enabledCount === 0 ? (
                  <BellOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Bell className="h-4 w-4 text-brand-700" />
                )}
                Categories you care about
              </CardTitle>
              <CardDescription>
                Ping me about new give-aways in:
              </CardDescription>
            </div>
            <Badge variant={enabledCount === 0 ? 'neutral' : 'default'}>
              {enabledCount}/{totalCategories} on
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600 mb-4 leading-relaxed">
            <strong className="text-slate-700">Why opt-in?</strong> WhatsApp
            groups ping everyone for every post, so important listings get
            buried. This way you only see the stuff you'd actually take.
          </div>
          <ul className="space-y-2">
            {(Object.keys(notificationPrefs) as ItemCategory[]).map((cat) => {
              const enabled = notificationPrefs[cat]
              return (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => toggleNotificationPref(cat)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                      enabled
                        ? 'border-brand-200 bg-brand-50/50 hover:bg-brand-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {CATEGORY_SHORT[cat]}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {enabled
                          ? 'On — you’ll see new listings in this category.'
                          : 'Off — silent for this category.'}
                      </p>
                    </div>
                    <Toggle enabled={enabled} />
                  </button>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent notifications</CardTitle>
          <CardDescription>
            Just the things matched to your preferences and your actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              You're all caught up.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 -mx-2">
              {notifications.map((n) => (
                <li key={n.id}>
                  <NotificationItem n={n} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationItem({ n }: { n: AppNotification }) {
  const body = (
    <div className="flex items-start gap-3 px-2 py-3 rounded-lg hover:bg-slate-50">
      <div className="h-8 w-8 grid place-items-center rounded-full bg-brand-50 text-brand-700 shrink-0 mt-0.5">
        {KIND_ICON[n.kind]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-900 leading-snug">
            {n.title}
          </p>
          <span className="text-xs text-slate-400 shrink-0 tabular-nums">
            {formatDateShort(n.createdAt)}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          {n.body}
        </p>
        {n.category && (
          <Badge variant="outline" className="mt-2">
            {CATEGORY_SHORT[n.category]}
          </Badge>
        )}
      </div>
    </div>
  )
  return n.href ? <Link to={n.href}>{body}</Link> : body
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 w-10 rounded-full p-0.5 transition-colors shrink-0',
        enabled ? 'bg-brand-600' : 'bg-slate-300',
      )}
      aria-hidden
    >
      <span
        className={cn(
          'h-5 w-5 rounded-full bg-white shadow transition-transform',
          enabled ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </span>
  )
}
