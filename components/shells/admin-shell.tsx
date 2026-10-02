"use client"

import { ShieldCheck, Users } from "lucide-react"
import { AppShell, type NavItem } from "./app-shell"

const navItems: NavItem[] = [
  { href: "/admin/moderation", label: "Moderation", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: Users },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell navItems={navItems} roleLabel="Admin" homeHref="/admin/moderation">
      {children}
    </AppShell>
  )
}