"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MapPin, Clock, Ticket, CalendarDays, Loader2, Users } from "lucide-react"
import { PlayerShell } from "@/components/shells/player-shell"
import { Card } from "@/components/ui/card"
import { ButtonLink } from "@/components/ui/button-link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SportBadge } from "@/components/sport-badge"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/mock-data"
import type { MyRegistration } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState<MyRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/registrations/my")
      const data = await res.json()
      if (data.registrations) {
        setRegistrations(data.registrations)
      } else {
        setError(data.error || "Не удалось загрузить записи")
      }
    } catch {
      setError("Ошибка сети")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCancel = async (reg: MyRegistration) => {
    if (!confirm(`Отменить запись на «${reg.eventTitle}»?`)) return

    setError(null)
    setCancellingId(reg.id)

    try {
      const res = await fetch(`/api/registrations/${reg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Не удалось отменить")
        setCancellingId(null)
        return
      }

      // Обновляем локально
      setRegistrations((prev) =>
        prev.map((r) => (r.id === reg.id ? { ...r, status: "cancelled", canCancel: false } : r))
      )
    } catch {
      setError("Ошибка сети")
    } finally {
      setCancellingId(null)
    }
  }

  const upcoming = registrations.filter((r) => !r.past && r.status === "confirmed")
  const past = registrations.filter((r) => r.past || r.status === "cancelled")

  return (
    <PlayerShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">My bookings</h1>
            <p className="text-muted-foreground">Your session registrations.</p>
          </div>
          <ButtonLink href="/events">Browse sessions</ButtonLink>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Upcoming" value={upcoming.length} icon={<CalendarDays className="size-5" />} />
              <Stat
                label="Completed"
                value={registrations.filter((r) => r.past && r.status === "confirmed").length}
                icon={<Ticket className="size-5" />}
              />
              <Stat label="Total" value={registrations.length} icon={<Clock className="size-5" />} />
            </div>

            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
                <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                {upcoming.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {upcoming.map((r) => (
                      <RegistrationRow
                        key={r.id}
                        registration={r}
                        onCancel={() => handleCancel(r)}
                        cancelling={cancellingId === r.id}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyBookings />
                )}
              </TabsContent>
              <TabsContent value="past">
                {past.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {past.map((r) => (
                      <RegistrationRow key={r.id} registration={r} />
                    ))}
                  </div>
                ) : (
                  <EmptyBookings />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </PlayerShell>
  )
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-none">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </Card>
  )
}

function RegistrationRow({
  registration,
  onCancel,
  cancelling,
}: {
  registration: MyRegistration
  onCancel?: () => void
  cancelling?: boolean
}) {
  const isCancelled = registration.status === "cancelled"

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Ticket className="size-5" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <SportBadge sport={registration.eventSport} />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {registration.eventType === "training" ? "Training" : "Game"}
          </span>
          {isCancelled && <Badge variant="danger">Отменено</Badge>}
        </div>
        <span className="font-semibold leading-tight">{registration.eventTitle}</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatDate(registration.eventDate)} · {registration.startTime}–{registration.endTime}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {registration.venueName}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        {!isCancelled && !registration.past && (
          <Badge variant="success">Confirmed</Badge>
        )}
        {registration.past && !isCancelled && (
          <Badge variant="neutral">Completed</Badge>
        )}
        {registration.canCancel && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                Отмена…
              </>
            ) : (
              "Cancel"
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}

function EmptyBookings() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <CalendarDays className="size-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold">Нет записей</p>
        <p className="text-sm text-muted-foreground">Запишитесь на тренировку или игру.</p>
      </div>
      <ButtonLink href="/events">
        <Users className="size-4" />
        Найти события
      </ButtonLink>
    </div>
  )
}