"use client"

import { CalendarDays, Ticket, User } from "lucide-react"
import { AppShell, type NavItem } from "./app-shell"

const navItems: NavItem[] = [
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard", label: "My Bookings", icon: Ticket },
  { href: "/onboarding", label: "Profile", icon: User },
]

export function PlayerShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      navItems={navItems}
      roleLabel="Player"
      homeHref="/events"
      mobileBottomNav
      sportRail
    >
      {children}
    </AppShell>
  )
}