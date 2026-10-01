import { cn } from "@/lib/utils"

export function Avatar({
  src,
  name,
  className,
}: {
  src?: string
  name: string
  className?: string
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-accent-foreground",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src || "/placeholder.svg"} alt={name} className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  )
}
