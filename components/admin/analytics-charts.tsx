"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ANALYTICS } from "@/lib/mock-data"

const GREEN = "oklch(0.62 0.15 150)"
const ORANGE = "oklch(0.68 0.16 45)"

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: 12,
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
}

export function BookingsTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={ANALYTICS.bookingsTrend} margin={{ left: -18, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="gVball" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gFball" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ORANGE} stopOpacity={0.3} />
            <stop offset="100%" stopColor={ORANGE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="volleyball" stroke={GREEN} strokeWidth={2} fill="url(#gVball)" />
        <Area type="monotone" dataKey="football" stroke={ORANGE} strokeWidth={2} fill="url(#gFball)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function UsersByCityChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={ANALYTICS.usersByCity} layout="vertical" margin={{ left: 24, right: 16 }}>
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
        <YAxis
          type="category"
          dataKey="city"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={90}
          stroke="var(--muted-foreground)"
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="users" fill={GREEN} radius={[0, 6, 6, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SportSplitChart() {
  const colors = [GREEN, ORANGE]
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={ANALYTICS.sportSplit}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          strokeWidth={0}
        >
          {ANALYTICS.sportSplit.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
      </PieChart>
    </ResponsiveContainer>
  )
}
