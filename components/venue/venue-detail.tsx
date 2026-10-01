"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Layers,
  Check,
  CircleCheck,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SportBadge } from "@/components/sport-badge"
import { BookingModal } from "@/components/venue/booking-modal"
import { generateSlots, type SlotStatus } from "@/lib/mock-data"
import type { Venue } from "@/lib/types"
import { cn } from "@/lib/utils"

const slotStyles: Record<SlotStatus, string> = {
  available: "border-border bg-card hover:border-primary hover:bg-primary/5",
  booked: "cursor-not-allowed border-transparent bg-muted text-muted-foreground/60 line-through",
  pending: "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-700",
}

export function VenueDetail({ venue }: { venue: Venue }) {
  const [imgIndex, setImgIndex] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const slots = generateSlots(1)

  const nextImg = () => setImgIndex((i) => (i + 1) % venue.images.length)
  const prevImg = () => setImgIndex((i) => (i - 1 + venue.images.length) % venue.images.length)

  const openBooking = () => {
    if (!selectedSlot) {
      const firstFree = slots.find((s) => s.status === "available")
      if (firstFree) setSelectedSlot(firstFree.time)
    }
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/venues"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to venues
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Gallery */}
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="relative aspect-[16/9] bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={venue.images[imgIndex] || "/placeholder.svg"}
                alt={`${venue.name} photo ${imgIndex + 1}`}
                className="size-full object-cover"
              />
              {venue.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImg}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur hover:bg-card"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImg}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur hover:bg-card"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {venue.images.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "size-1.5 rounded-full transition-colors",
                          i === imgIndex ? "bg-card" : "bg-card/50",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Header info */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {venue.sports.map((s) => (
                <SportBadge key={s} sport={s} />
              ))}
              <Badge variant="outline">
                <Layers className="size-3.5" />
                {venue.surface}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{venue.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {venue.address}
              </span>
            </div>
            <p className="mt-1 leading-relaxed text-muted-foreground">{venue.description}</p>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2">
            {venue.amenities.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm"
              >
                <Check className="size-3.5 text-primary" />
                {a}
              </span>
            ))}
          </div>

          {/* Availability */}
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Availability</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm border border-border bg-card" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-amber-200" /> Pending
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-muted" /> Booked
                </span>
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Today · hourly slots, 08:00–23:00</p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot.time && slot.status === "available"
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={slot.status !== "available"}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={cn(
                      "rounded-lg border-2 px-2 py-2.5 text-sm font-medium transition-colors",
                      slotStyles[slot.status],
                      isSelected && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {slot.time}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 p-5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">${venue.pricePerHour}</span>
              <span className="text-muted-foreground">/ hour</span>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-y border-border py-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Selected slot</span>
                <span className="font-medium">
                  {selectedSlot ? `${selectedSlot}` : "Pick a time below"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">{venue.providerName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="size-3.5" />
                {venue.providerPhone}
              </div>
            </div>
            <Button size="lg" className="mt-4 h-11 w-full text-base" onClick={openBooking}>
              Book now
            </Button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <CircleCheck className="size-3.5 text-primary" />
              Free cancellation up to 12h before
            </p>
          </Card>
        </div>
      </div>

      <BookingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        venue={venue}
        slot={selectedSlot}
      />
    </div>
  )
}