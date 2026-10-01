"use client"

import { MapPin, CalendarDays, Ticket, User } from "lucide-react"
import { AppShell, type NavItem } from "./app-shell"

const navItems: NavItem[] = [
  { href: "/venues", label: "Venues", icon: MapPin },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard", label: "My Bookings", icon: Ticket },
  { href: "/onboarding", label: "Profile", icon: User },
]

export function PlayerShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      navItems={navItems}
      roleLabel="Player"
      userName="Jordan Lee"
      homeHref="/venues"
      mobileBottomNav
      sportRail
    >
      {children}
    </AppShell>
  )
}
