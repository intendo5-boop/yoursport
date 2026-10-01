"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Repeat,
  CircleCheck,
  CircleAlert,
  CalendarDays,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SportBadge } from "@/components/sport-badge"
import { Avatar } from "@/components/ui/avatar"
import { EventRegisterModal } from "@/components/event/event-register-modal"
import { formatDate, skillLabel, SPECIALIZATIONS } from "@/lib/mock-data"
import type { SportEvent } from "@/lib/types"

interface Props {
  event: SportEvent
  isAuthenticated: boolean
  isRegistered: boolean
  isProvider: boolean
}

export function EventDetail({
  event,
  isAuthenticated,
  isRegistered,
  isProvider,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const spotsLeft = event.capacity - event.registered
  const fillPct =
    event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0
  const isFull = spotsLeft <= 0
  const registrationClosed = event.registered >= event.capacity

  const handleCancel = async () => {
    if (!confirm("Отменить запись на это событие?")) return

    setError(null)
    setCancelling(true)

    try {
      // Сначала найдём registration id через API
      const listRes = await fetch("/api/registrations/my")
      const listData = await listRes.json()

      const myReg = listData.registrations?.find(
        (r: any) => r.eventId === event.id && r.status === "confirmed"
      )

      if (!myReg) {
        setError("Запись не найдена")
        setCancelling(false)
        return
      }

      const res = await fetch(`/api/registrations/${myReg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Не удалось отменить запись")
        setCancelling(false)
        return
      }

      router.refresh()
    } catch {
      setError("Ошибка сети")
    } finally {
      setCancelling(false)
    }
  }

  const renderAction = () => {
    if (isProvider) {
      return (
        <Button size="lg" className="mt-4 h-11 w-full text-base" disabled>
          Вы организатор
        </Button>
      )
    }

    if (!isAuthenticated) {
      return (
        <Link href="/login" className="block">
          <Button size="lg" className="mt-4 h-11 w-full text-base">
            Войдите, чтобы записаться
          </Button>
        </Link>
      )
    }

    if (isRegistered) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            <CircleCheck className="size-4" />
            Вы записаны
          </div>
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Отмена…
              </>
            ) : (
              "Отменить запись"
            )}
          </Button>
        </div>
      )
    }

    return (
      <Button
        size="lg"
        className="mt-4 h-11 w-full text-base"
        disabled={isFull}
        onClick={() => setOpen(true)}
      >
        {isFull ? "Мест нет" : "Register now"}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/events"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to sessions
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <SportBadge sport={event.sport} />
              <Badge variant={event.type === "training" ? "accent" : "outline"}>
                {event.type === "training" ? "Training" : "Game"}
              </Badge>
              {event.recurring && (
                <Badge variant="outline">
                  <Repeat className="size-3" />
                  Repeats weekly
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              {event.title}
            </h1>
            <span className="inline-flex w-fit rounded-md bg-muted px-2.5 py-1 text-sm font-medium text-muted-foreground">
              {skillLabel(event.sport, event.level)} level
            </span>
            {event.description && (
              <p className="mt-1 leading-relaxed text-muted-foreground">{event.description}</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile
              icon={<CalendarDays className="size-4" />}
              label="Date"
              value={formatDate(event.date)}
            />
            <InfoTile
              icon={<Clock className="size-4" />}
              label="Time"
              value={`${event.startTime} – ${event.endTime}`}
            />
            <InfoTile
              icon={<MapPin className="size-4" />}
              label="Venue"
              value={event.venueName}
            />
          </div>

          {event.specializations.length > 0 && (
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Focus areas</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.specializations.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <Card className="flex items-center gap-4 p-5">
            <Avatar src={event.trainer.photo} name={event.trainer.name} className="size-14" />
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your coach
              </span>
              <span className="text-lg font-semibold">{event.trainer.name}</span>
              {event.trainer.experience && (
                <span className="text-sm text-muted-foreground">{event.trainer.experience}</span>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 p-5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">${event.price}</span>
              <span className="text-muted-foreground">/ person</span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-4" />
                  Spots
                </span>
                <span className="font-semibold">
                  {isFull
                    ? "Мест нет"
                    : `${event.registered} из ${event.capacity}`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={isFull ? "h-full bg-destructive" : "h-full bg-primary"}
                  style={{ width: `${Math.min(fillPct, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CircleCheck className="size-3.5 text-primary" />
                Register up to {event.registrationDeadlineHours}h before start
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CircleAlert className="size-3.5 text-amber-600" />
                Free cancellation up to {event.cancellationDeadlineHours}h before
              </span>
            </div>

            {error && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {renderAction()}
          </Card>
        </div>
      </div>

      <EventRegisterModal open={open} onOpenChange={setOpen} event={event} />
    </div>
  )
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}