"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogIn, LogOut, ChevronDown } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface SessionData {
  userId: string
  email: string
  name: string
  roles: string[]
}

export function UserMenu() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()
        if (!cancelled) {
          setSession(data.session ?? null)
        }
      } catch {
        if (!cancelled) {
          setSession(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadSession()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setSession(null)
    setMenuOpen(false)
    router.push("/events")
    router.refresh()
  }

  if (loading) {
    return <div className="size-9 rounded-full bg-muted animate-pulse" />
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        <LogIn className="size-4" />
        <span className="hidden sm:inline">Войти</span>
      </Link>
    )
  }

  const primaryRole = session.roles?.[0] ?? "player"

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 text-sm transition-colors hover:bg-muted"
      >
        <Avatar name={session.name} className="size-7" />
        <span className="hidden max-w-24 truncate font-medium sm:inline">
          {session.name}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs text-muted-foreground">Вы вошли как</p>
            <p className="truncate text-sm font-medium">{session.email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground capitalize">
              Роль: {primaryRole}
            </p>
          </div>

          {primaryRole === "provider" && (
            <Link
              href="/provider"
              className="block px-3 py-2 text-sm transition-colors hover:bg-muted"
              onClick={() => setMenuOpen(false)}
            >
              Кабинет провайдера
            </Link>
          )}

          {primaryRole === "player" && (
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-sm transition-colors hover:bg-muted"
              onClick={() => setMenuOpen(false)}
            >
              Мои записи
            </Link>
          )}

          {primaryRole === "admin" && (
            <Link
              href="/admin/moderation"
              className="block px-3 py-2 text-sm transition-colors hover:bg-muted"
              onClick={() => setMenuOpen(false)}
            >
              Админ-панель
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-muted"
          >
            <LogOut className="size-4" />
            Выйти
          </button>
        </div>
      )}
    </div>
  )
}