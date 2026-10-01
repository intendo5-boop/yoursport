"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarCheck, MapPin } from "lucide-react"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SportBadge } from "@/components/sport-badge"
import type { Venue } from "@/lib/types"

const durations = [1, 2, 3]

export function BookingModal({
  open,
  onOpenChange,
  venue,
  slot,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  venue: Venue
  slot: string | null
}) {
  const router = useRouter()
  const [duration, setDuration] = useState(1)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const total = venue.pricePerHour * duration
  const serviceFee = Math.round(total * 0.08)

  const confirm = () => {
    setSubmitting(true)
    const params = new URLSearchParams({
      venue: venue.id,
      slot: slot ?? "18:00",
      duration: String(duration),
      total: String(total + serviceFee),
    })
    setTimeout(() => {
      onOpenChange(false)
      setSubmitting(false)
      router.push(`/bookings/confirmation?${params.toString()}`)
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Confirm your booking</DialogTitle>
      </DialogHeader>

      <div className="px-5">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 rounded-xl border border-border bg-muted/40 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={venue.images[0] || "/placeholder.svg"}
              alt={venue.name}
              className="size-16 shrink-0 rounded-lg object-cover"
            />
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-1.5">
                {venue.sports.map((s) => (
                  <SportBadge key={s} sport={s} />
                ))}
              </div>
              <p className="font-semibold leading-tight">{venue.name}</p>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {venue.address}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Start time</Label>
              <div className="flex h-10 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm font-medium">
                {slot ?? "18:00"}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Duration</Label>
              <div className="flex gap-1.5">
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={
                      "flex h-10 flex-1 items-center justify-center rounded-lg border-2 text-sm font-medium transition-colors " +
                      (duration === d
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:border-primary/40")
                    }
                  >
                    {d}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes for the provider (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. we'll need 6 bibs and a match ball"
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                ${venue.pricePerHour} × {duration}h
              </span>
              <span>${total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service fee</span>
              <span>${serviceFee}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span>${total + serviceFee}</span>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={confirm} disabled={submitting}>
          <CalendarCheck className="size-4" />
          {submitting ? "Confirming…" : `Request booking · $${total + serviceFee}`}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
