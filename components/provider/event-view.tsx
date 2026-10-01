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
  Pencil,
  Trash2,
  Loader2,
  Mail,
  Phone,
  Inbox,
} from "lucide-react"
import { ProviderShell } from "@/components/shells/provider-shell"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SportBadge } from "@/components/sport-badge"
import { Avatar } from "@/components/ui/avatar"
import { formatDate, skillLabel } from "@/lib/mock-data"
import type { SportEvent, EventRegistration } from "@/lib/types"

interface Props {
  event: SportEvent
  registrations: EventRegistration[]
}

export function EventView({ event, registrations }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const spotsLeft = event.capacity - event.registered
  const fillPct =
    event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0
  const isFull = spotsLeft <= 0

  const handleDelete = async () => {
    if (!confirm("Удалить событие? Это действие нельзя отменить.")) return

    setError(null)
    setDeleting(true)

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Не удалось удалить")
        setDeleting(false)
        return
      }

      router.push("/provider/events")
      router.refresh()
    } catch {
      setError("Ошибка сети. Попробуйте снова.")
      setDeleting(false)
    }
  }

  return (
    <ProviderShell>
      <div className="flex flex-col gap-6">
        <Link
          href="/provider/events"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sessions
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Session overview</h1>
            <p className="text-muted-foreground">
              Так событие видят игроки. Вы можете отредактировать его или удалить.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ButtonLink href={`/provider/events/${event.id}/edit`} variant="outline">
              <Pencil className="size-4" />
              Edit
            </ButtonLink>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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
                  Trainer
                </span>
                <span className="text-lg font-semibold">{event.trainer.name}</span>
                {event.trainer.experience && (
                  <span className="text-sm text-muted-foreground">{event.trainer.experience}</span>
                )}
              </div>
            </Card>

            {/* Registrations list */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Записавшиеся игроки
                </h2>
                <Badge variant={isFull ? "danger" : "success"}>
                  {event.registered} / {event.capacity}
                </Badge>
              </div>

              {registrations.length === 0 ? (
                <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Inbox className="size-6" />
                  </span>
                  <div>
                    <p className="font-semibold">Пока никто не записался</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Как только игроки запишутся, они появятся здесь.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  {registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
                    >
                      <Avatar name={reg.playerName} className="size-10" />
                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium truncate">{reg.playerName}</span>
                          {reg.playerLevel && (
                            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              {skillLabel(event.sport, reg.playerLevel)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Mail className="size-3" />
                            {reg.playerEmail}
                          </span>
                          {reg.playerPhone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="size-3" />
                              {reg.playerPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    {event.registered} из {event.capacity}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={isFull ? "h-full bg-destructive" : "h-full bg-primary"}
                    style={{ width: `${Math.min(fillPct, 100)}%` }}
                  />
                </div>
                {isFull && <p className="text-xs text-destructive">Все места заняты</p>}
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CircleCheck className="size-3.5 text-primary" />
                  Запись закрывается за {event.registrationDeadlineHours}ч до начала
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CircleAlert className="size-3.5 text-amber-600" />
                  Отмена за {event.cancellationDeadlineHours}ч до начала
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProviderShell>
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