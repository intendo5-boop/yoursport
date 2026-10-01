"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CircleCheck, Ticket, Loader2, AlertCircle } from "lucide-react"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Checkbox } from "@/components/ui/checkbox"
import { SportBadge } from "@/components/sport-badge"
import { formatDate } from "@/lib/mock-data"
import type { SportEvent } from "@/lib/types"

export function EventRegisterModal({
  open,
  onOpenChange,
  event,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: SportEvent
}) {
  const router = useRouter()
  const [agree, setAgree] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  const close = () => {
    onOpenChange(false)
    // сброс состояния после закрытия
    setTimeout(() => {
      setDone(false)
      setError(null)
      setErrorCode(null)
      setAgree(false)
    }, 200)
  }

  const confirm = async () => {
    setError(null)
    setErrorCode(null)
    setSubmitting(true)

    try {
      const res = await fetch(`/api/events/${event.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Не удалось записаться")
        setErrorCode(data.code ?? null)
        setSubmitting(false)
        return
      }

      setDone(true)
      setSubmitting(false)
      router.refresh()
    } catch {
      setError("Ошибка сети. Попробуйте снова.")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogHeader>
        <DialogTitle>{done ? "You're registered!" : "Register for session"}</DialogTitle>
      </DialogHeader>

      {done ? (
        <div className="flex flex-col items-center gap-4 px-5 py-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <CircleCheck className="size-8 text-primary" strokeWidth={2.2} />
          </div>
          <p className="text-pretty text-muted-foreground">
            Your spot in <span className="font-medium text-foreground">{event.title}</span> is
            confirmed for {formatDate(event.date)} at {event.startTime}. See you on the court!
          </p>
        </div>
      ) : (
        <div className="px-5">
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <div className="mb-1 flex flex-wrap gap-1.5">
                <SportBadge sport={event.sport} />
              </div>
              <p className="font-semibold leading-tight">{event.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(event.date)} · {event.startTime}–{event.endTime} · {event.venueName}
              </p>
            </div>

            {error && (
              <div
                className={
                  "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm " +
                  (errorCode === "PROFILE_INCOMPLETE" || errorCode === "LEVEL_REQUIRED"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-red-200 bg-red-50 text-red-700")
                }
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span>{error}</span>
                  {errorCode === "PROFILE_INCOMPLETE" && (
                    <ButtonLink
                      href="/onboarding"
                      variant="outline"
                      size="sm"
                      className="mt-1 w-fit"
                      onClick={close}
                    >
                      Заполнить профиль
                    </ButtonLink>
                  )}
                  {errorCode === "LEVEL_REQUIRED" && (
                    <ButtonLink
                      href="/onboarding"
                      variant="outline"
                      size="sm"
                      className="mt-1 w-fit"
                      onClick={close}
                    >
                      Указать уровень
                    </ButtonLink>
                  )}
                </div>
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border p-3 text-sm">
              <Checkbox
                checked={agree}
                onCheckedChange={(v) => setAgree(Boolean(v))}
                className="mt-0.5"
                disabled={submitting}
              />
              <span className="text-muted-foreground">
                I understand the cancellation policy: free cancellation up to{" "}
                {event.cancellationDeadlineHours}h before start.
              </span>
            </label>

            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">Total due</span>
              <span className="text-base font-semibold">${event.price}</span>
            </div>
          </div>
        </div>
      )}

      <DialogFooter>
        {done ? (
          <>
            <Button variant="outline" onClick={close}>
              Close
            </Button>
            <ButtonLink href="/dashboard" onClick={close}>
              View my bookings
            </ButtonLink>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={!agree || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Запись…
                </>
              ) : (
                <>
                  <Ticket className="size-4" />
                  Confirm · ${event.price}
                </>
              )}
            </Button>
          </>
        )}
      </DialogFooter>
    </Dialog>
  )
}