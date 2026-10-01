import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function Rating({
  value,
  reviewCount,
  className,
}: {
  value: number
  reviewCount?: number
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="size-4 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-muted-foreground">({reviewCount})</span>
      )}
    </span>
  )
}
