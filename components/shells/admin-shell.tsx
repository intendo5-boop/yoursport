"use client"

import { ShieldCheck, ChartColumn } from "lucide-react"
import { AppShell, type NavItem } from "./app-shell"

const navItems: NavItem[] = [
  { href: "/admin/moderation", label: "Moderation", icon: ShieldCheck },
  { href: "/admin/analytics", label: "Analytics", icon: ChartColumn },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      navItems={navItems}
      roleLabel="Admin"
      userName="Casey Admin"
      homeHref="/admin/moderation"
    >
      {children}
    </AppShell>
  )
}
