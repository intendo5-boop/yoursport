import Link from "next/link"
import {
  Building2,
  Inbox,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react"
import { ProviderShell } from "@/components/shells/provider-shell"
import { Card } from "@/components/ui/card"
import { ButtonLink } from "@/components/ui/button-link"
import { Badge } from "@/components/ui/badge"
import { SportBadge } from "@/components/sport-badge"
import { BOOKING_REQUESTS, PROVIDER_VENUES, EVENTS, formatDate } from "@/lib/mock-data"

export default function ProviderDashboard() {
  const pendingRequests = BOOKING_REQUESTS.slice(0, 3)
  const upcomingEvents = EVENTS.slice(0, 3)

  return (
    <ProviderShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Skyline Sports</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening across your venues today.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Active venues" value={String(PROVIDER_VENUES.length)} icon={<Building2 className="size-5" />} />
          <Stat label="Pending requests" value={String(BOOKING_REQUESTS.length)} icon={<Inbox className="size-5" />} highlight />
          <Stat label="Upcoming sessions" value={String(EVENTS.length)} icon={<CalendarCheck className="size-5" />} />
          <Stat label="Revenue (30d)" value="$4,280" icon={<DollarSign className="size-5" />} trend="+12%" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Requests */}
          <Card className="p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Latest booking requests</h2>
              <Link
                href="/provider/requests"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {pendingRequests.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{r.playerName}</span>
                    <span className="text-sm text-muted-foreground">
                      {r.venueName} · {formatDate(r.date)} · {r.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">${r.price}</span>
                    <Badge variant="warning">
                      <Clock className="size-3" />
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-3 p-5">
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <ButtonLink href="/provider/venues/new" className="w-full justify-start">
                <Building2 className="size-4" />
                Add a venue
              </ButtonLink>
              <ButtonLink href="/provider/events/new" variant="outline" className="w-full justify-start">
                <CalendarCheck className="size-4" />
                Create a session
              </ButtonLink>
              <ButtonLink href="/provider/requests" variant="outline" className="w-full justify-start">
                <Inbox className="size-4" />
                Review requests
              </ButtonLink>
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 text-lg font-semibold">Your sessions</h2>
              <div className="flex flex-col gap-3">
                {upcomingEvents.map((e) => (
                  <div key={e.id} className="flex items-center gap-2">
                    <SportBadge sport={e.sport} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{e.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(e.date)} · {e.registered}/{e.capacity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProviderShell>
  )
}

function Stat({
  label,
  value,
  icon,
  highlight,
  trend,
}: {
  label: string
  value: string
  icon: React.ReactNode
  highlight?: boolean
  trend?: string
}) {
  return (
    <Card className={"flex flex-col gap-3 p-5 " + (highlight ? "border-primary/40 bg-primary/5" : "")}>
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {trend && (
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-primary">
            <TrendingUp className="size-3.5" />
            {trend}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-none">{value}</span>
        <span className="mt-1 text-sm text-muted-foreground">{label}</span>
      </div>
    </Card>
  )
}
