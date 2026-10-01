import Link from "next/link"
import { Volleyball } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Volleyball className="size-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">Rally</span>
    </Link>
  )
}
