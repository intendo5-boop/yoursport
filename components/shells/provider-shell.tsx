"use client"

import { LayoutDashboard, Building2, Inbox, CalendarCheck, Users } from "lucide-react"
import { AppShell, type NavItem } from "./app-shell"

const navItems: NavItem[] = [
  { href: "/provider", label: "Dashboard", icon: LayoutDashboard },
  { href: "/provider/venues", label: "My Venues", icon: Building2 },
  { href: "/provider/trainers", label: "My Trainers", icon: Users },
  { href: "/provider/events", label: "My Events", icon: CalendarCheck },
  { href: "/provider/requests", label: "Requests", icon: Inbox },
]

export function ProviderShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell navItems={navItems} roleLabel="Training Provider" homeHref="/provider">
      {children}
    </AppShell>
  )
}