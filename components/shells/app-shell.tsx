"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { UserMenu } from "@/components/user-menu"
import { SportRail, SportRailMobile } from "@/components/shells/sport-rail"
import { cn } from "@/lib/utils"

export interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface AppShellProps {
  navItems: NavItem[]
  roleLabel: string
  homeHref: string
  children: React.ReactNode
  /** show a fixed bottom nav on mobile using navItems */
  mobileBottomNav?: boolean
  /** show the left vertical sport selector rail */
  sportRail?: boolean
}

export function AppShell({
  navItems,
  roleLabel,
  homeHref,
  children,
  mobileBottomNav,
  sportRail,
}: AppShellProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) =>
    href === homeHref ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex min-h-screen bg-background">
      {sportRail && <SportRail />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
            <Logo href={homeHref} />
            <span className="hidden rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:inline">
              {roleLabel}
            </span>

            <nav className="ml-4 hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <UserMenu />
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav className="border-t border-border bg-card px-4 py-2 md:hidden">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}
        </header>

        {sportRail && <SportRailMobile />}

        <main
          className={cn(
            "mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6",
            mobileBottomNav && "pb-24 md:pb-6",
          )}
        >
          {children}
        </main>

        {mobileBottomNav && (
          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-md items-stretch justify-around">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[0.7rem] font-medium transition-colors",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}