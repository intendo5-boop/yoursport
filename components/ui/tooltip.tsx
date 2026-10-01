"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function Tooltip({
  content,
  children,
  className,
}: {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            "absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-foreground px-3 py-2 text-xs leading-relaxed text-background shadow-lg",
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
