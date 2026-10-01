import { CalendarCheck, Users, DollarSign, Building2, TrendingUp, TrendingDown } from "lucide-react"
import { AdminShell } from "@/components/shells/admin-shell"
import { Card } from "@/components/ui/card"
import {
  BookingsTrendChart,
  UsersByCityChart,
  SportSplitChart,
} from "@/components/admin/analytics-charts"
import { ANALYTICS } from "@/lib/mock-data"

export default function AnalyticsPage() {
  const { kpis } = ANALYTICS
  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Platform analytics</h1>
          <p className="text-muted-foreground">Marketplace performance across all cities and providers.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Total bookings" value={kpis.bookings.value.toLocaleString()} delta={kpis.bookings.delta} icon={<CalendarCheck className="size-5" />} />
          <Kpi label="Active users" value={kpis.activeUsers.value.toLocaleString()} delta={kpis.activeUsers.delta} icon={<Users className="size-5" />} />
          <Kpi label="Revenue" value={`$${kpis.revenue.value.toLocaleString()}`} delta={kpis.revenue.delta} icon={<DollarSign className="size-5" />} />
          <Kpi label="Providers" value={String(kpis.providers.value)} delta={kpis.providers.delta} icon={<Building2 className="size-5" />} />
        </div>

        <Card className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bookings over time</h2>
            <div className="flex items-center gap-4 text-sm">
              <Legend color="bg-primary" label="Volleyball" />
              <Legend color="bg-chart-2" label="Football" />
            </div>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Monthly booking volume by sport</p>
          <BookingsTrendChart />
        </Card>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-3">
            <h2 className="text-lg font-semibold">Users by city</h2>
            <p className="mb-4 text-sm text-muted-foreground">Active players per metro area</p>
            <UsersByCityChart />
          </Card>
          <Card className="flex flex-col p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold">Sport split</h2>
            <p className="mb-4 text-sm text-muted-foreground">Share of total bookings</p>
            <SportSplitChart />
            <div className="mt-2 flex items-center justify-center gap-6 text-sm">
              <Legend color="bg-primary" label="Volleyball 58%" />
              <Legend color="bg-chart-2" label="Football 42%" />
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}

function Kpi({
  label,
  value,
  delta,
  icon,
}: {
  label: string
  value: string
  delta: number
  icon: React.ReactNode
}) {
  const positive = delta >= 0
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <span
          className={
            "inline-flex items-center gap-0.5 text-xs font-medium " +
            (positive ? "text-primary" : "text-destructive")
          }
        >
          {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {Math.abs(delta)}%
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-none">{value}</span>
        <span className="mt-1 text-sm text-muted-foreground">{label}</span>
      </div>
    </Card>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className={"size-2.5 rounded-full " + color} />
      {label}
    </span>
  )
}
