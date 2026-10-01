import { CircleCheck, Clock, CircleX, Ban, CheckCheck, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { BookingStatus, ModerationStatus } from "@/lib/types"

type BadgeVariant = "success" | "warning" | "danger" | "neutral"

const bookingMap: Record<
  BookingStatus,
  { label: string; variant: BadgeVariant; icon: typeof Clock }
> = {
  confirmed: { label: "Confirmed", variant: "success", icon: CircleCheck },
  pending: { label: "Pending", variant: "warning", icon: Clock },
  rejected: { label: "Rejected", variant: "danger", icon: CircleX },
  cancelled: { label: "Cancelled", variant: "danger", icon: Ban },
  completed: { label: "Completed", variant: "neutral", icon: CheckCheck },
}

export function StatusBadge({
  status,
  size,
}: {
  status: BookingStatus | string | undefined | null
  size?: "sm" | "default" | "lg"
}) {
  const entry = status ? bookingMap[status as BookingStatus] : undefined

  if (!entry) {
    return (
      <Badge variant="neutral" size={size}>
        <AlertCircle />
        {status || "Unknown"}
      </Badge>
    )
  }

  const { label, variant, icon: Icon } = entry
  return (
    <Badge variant={variant} size={size}>
      <Icon />
      {label}
    </Badge>
  )
}

const moderationMap: Record<
  ModerationStatus,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  approved: { label: "Approved", variant: "success" },
  pending: { label: "Pending review", variant: "warning" },
  rejected: { label: "Rejected", variant: "danger" },
}

export function ModerationBadge({
  status,
}: {
  status: ModerationStatus | string | undefined | null
}) {
  const entry = status ? moderationMap[status as ModerationStatus] : undefined

  if (!entry) {
    return (
      <Badge variant="warning">
        <AlertCircle />
        {status || "Unknown"}
      </Badge>
    )
  }

  const { label, variant } = entry
  return <Badge variant={variant}>{label}</Badge>
}