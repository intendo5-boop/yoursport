import { Suspense } from "react"
import { PlayerShell } from "@/components/shells/player-shell"
import { BookingConfirmation } from "@/components/venue/booking-confirmation"

export default function BookingConfirmationPage() {
  return (
    <PlayerShell>
      <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading…</div>}>
        <BookingConfirmation />
      </Suspense>
    </PlayerShell>
  )
}
