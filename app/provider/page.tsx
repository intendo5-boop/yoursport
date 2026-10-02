"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Building2,
  Inbox,
  CalendarCheck,
  ArrowRight,
  Users,
  Loader2,
  Plus,
  AlertTriangle,
  Clock,
  ShieldAlert,
} from "lucide-react"
import { ProviderShell } from "@/components/shells/provider-shell"
import { Card } from "@/components/ui/card"
import { ButtonLink } from "@/components/ui/button-link"
import { Badge } from "@/components/ui/badge"
import { SportBadge } from "@/components/sport-badge"
import { formatDate } from "@/lib/mock-data"
import { adaptEvent } from "@/lib/adapters"
import type { SportEvent } from "@/lib/types"

type ModerationStatus = "pending" | "approved" | "rejected"

interface ProviderStatus {
  isProvider: boolean
  moderationStatus?: ModerationStatus
  rejectionReason?: string | null
}

export default function ProviderDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [providerName, setProviderName] = useState("")
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null)
  const [venuesCount, setVenuesCount] = useState(0)
  const [events, setEvents] = useState<SportEvent[]>([])
  const [trainersCount, setTrainersCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [sessionRes, statusRes, venuesRes, eventsRes, trainersRes] =
          await Promise.all([
            fetch("/api/auth/session"),
            fetch("/api/me/provider-status"),
            fetch("/api/venues/my"),
            fetch("/api/events/my"),
            fetch("/api/trainers"),
          ])

        if (cancelled) return

        const sessionData = await sessionRes.json()
        const statusData = await statusRes.json()
        const venuesData = await venuesRes.json()
        const eventsData = await eventsRes.json()
        const trainersData = await trainersRes.json()

        if (sessionData.session) {
          setProviderName(sessionData.session.name ?? "Provider")
        }
        if (statusData && !statusData.error) {
          setProviderStatus(statusData)
        }
        if (venuesData.venues) {
          setVenuesCount(venuesData.venues.length)
        }
        if (eventsData.events) {
          setEvents(eventsData.events.map(adaptEvent))
        }
        if (trainersData.trainers) {
          setTrainersCount(trainersData.trainers.length)
        }
      } catch (err) {
        console.error("Load dashboard error:", err)
        setError("Не удалось загрузить данные")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  if (loading) {
    return (
      <ProviderShell>
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </Card>
      </ProviderShell>
    )
  }

  const moderationStatus = providerStatus?.moderationStatus

  return (
    <ProviderShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {providerName || "Provider"}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening across your venues today.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ===== Баннер о статусе модерации ===== */}
        {moderationStatus === "pending" && (
          <Card className="flex flex-col gap-3 border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-start">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-amber-900">
                Ваш аккаунт находится на модерации
              </h3>
              <p className="text-sm text-amber-800">
                Вы можете создавать площадки, тренеров и события — они сразу
                сохраняются в системе. Однако они станут публичными только
                после того, как администратор одобрит ваш аккаунт и каждую
                площадку отдельно. Игроки не увидят их до этого момента.
              </p>
            </div>
          </Card>
        )}

        {moderationStatus === "rejected" && (
          <Card className="flex flex-col gap-3 border-red-200 bg-red-50 p-5 sm:flex-row sm:items-start">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <ShieldAlert className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-red-900">
                Ваш аккаунт отклонён
              </h3>
              <p className="text-sm text-red-800">
                {providerStatus?.rejectionReason ||
                  "Администратор отклонил ваш аккаунт. Свяжитесь с поддержкой для уточнения причины."}
              </p>
            </div>
          </Card>
        )}

        {moderationStatus === "approved" && venuesCount > 0 && (
          <PendingVenuesHint />
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Active venues"
            value={String(venuesCount)}
            icon={<Building2 className="size-5" />}
          />
          <Stat
            label="My trainers"
            value={String(trainersCount)}
            icon={<Users className="size-5" />}
          />
          <Stat
            label="All sessions"
            value={String(events.length)}
            icon={<CalendarCheck className="size-5" />}
          />
          <Stat
            label="Upcoming"
            value={String(upcomingEvents.length)}
            icon={<CalendarCheck className="size-5" />}
            highlight={upcomingEvents.length > 0}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your sessions</h2>
              <Link
                href="/provider/events"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-12 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <CalendarCheck className="size-6" />
                </span>
                <div>
                  <p className="font-semibold">Пока нет событий</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Создайте тренировку или игру, чтобы игроки могли записаться.
                  </p>
                </div>
                <ButtonLink href="/provider/events/new">
                  <Plus className="size-4" />
                  Создать событие
                </ButtonLink>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((e) => (
                    <Link
                      key={e.id}
                      href={`/provider/events/${e.id}`}
                      className="flex flex-col gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <SportBadge sport={e.sport} />
                          <span className="truncate font-medium">{e.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(e.date)} · {e.startTime}–{e.endTime} · {e.venueName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {e.registered}/{e.capacity}
                        </span>
                        <Badge variant="success">
                          <Users className="size-3" />
                          {e.registered}
                        </Badge>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Нет предстоящих событий. Создайте новое.
                  </p>
                )}
              </div>
            )}
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-3 p-5">
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <ButtonLink href="/provider/venues/new" className="w-full justify-start">
                <Building2 className="size-4" />
                Add a venue
              </ButtonLink>
              <ButtonLink
                href="/provider/events/new"
                variant="outline"
                className="w-full justify-start"
              >
                <CalendarCheck className="size-4" />
                Create a session
              </ButtonLink>
              <ButtonLink
                href="/provider/trainers"
                variant="outline"
                className="w-full justify-start"
              >
                <Users className="size-4" />
                Manage trainers
              </ButtonLink>
            </Card>

            <Card className="flex flex-col gap-3 p-5">
              <h2 className="text-lg font-semibold">Booking requests</h2>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-6 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Inbox className="size-5" />
                </span>
                <p className="text-sm text-muted-foreground">
                  Бронирование площадок скоро появится
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProviderShell>
  )
}

function PendingVenuesHint() {
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/venues/my")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (Array.isArray(data.venues)) {
          const pending = data.venues.filter(
            (v: any) => v.moderationStatus === "pending"
          ).length
          setPendingCount(pending)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!pendingCount || pendingCount === 0) return null

  return (
    <Card className="flex flex-col gap-2 border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
        <AlertTriangle className="size-4" />
      </div>
      <p className="flex-1 text-sm text-amber-800">
        {pendingCount === 1
          ? "1 площадка ожидает одобрения администратором."
          : `${pendingCount} площадок ожидают одобрения администратором.`}{" "}
        События на этих площадках не будут видны игрокам до одобрения.
      </p>
      <Link
        href="/provider/venues"
        className="text-sm font-medium text-amber-900 underline hover:no-underline"
      >
        Мои площадки →
      </Link>
    </Card>
  )
}

function Stat({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: string
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <Card
      className={
        "flex flex-col gap-3 p-5 " +
        (highlight ? "border-primary/40 bg-primary/5" : "")
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-none">{value}</span>
        <span className="mt-1 text-sm text-muted-foreground">{label}</span>
      </div>
    </Card>
  )
}