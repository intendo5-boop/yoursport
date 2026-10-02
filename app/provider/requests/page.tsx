import { Inbox } from "lucide-react"
import { ProviderShell } from "@/components/shells/provider-shell"
import { Card } from "@/components/ui/card"

export default function RequestsPage() {
  return (
    <ProviderShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Booking requests</h1>
          <p className="text-muted-foreground">
            Approve or decline requests to book your venues.
          </p>
        </div>

        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-8" />
          </span>
          <div>
            <p className="text-lg font-semibold">Бронирование площадок скоро появится</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Сейчас провайдер может создавать площадки, тренеров и события, а игроки — записываться на события.
              Аренда площадок будет добавлена в следующем обновлении.
            </p>
          </div>
        </Card>
      </div>
    </ProviderShell>
  )
}