import { Volleyball, Goal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SPORT_LABELS } from "@/lib/mock-data"
import type { Sport } from "@/lib/types"
import { cn } from "@/lib/utils"

export function SportIcon({ sport, className }: { sport: Sport; className?: string }) {
  const Icon = sport === "volleyball" ? Volleyball : Goal
  return <Icon className={cn("size-4", className)} />
}

export function SportBadge({ sport, size }: { sport: Sport; size?: "sm" | "default" | "lg" }) {
  return (
    <Badge
      variant={sport === "volleyball" ? "info" : "accent"}
      size={size}
    >
      <SportIcon sport={sport} />
      {SPORT_LABELS[sport]}
    </Badge>
  )
}
