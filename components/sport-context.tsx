"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { Sport } from "@/lib/types"

export type SportFilter = Sport | "all"

const STORAGE_KEY = "rally.sport"

interface SportContextValue {
  sport: SportFilter
  setSport: (sport: SportFilter) => void
}

const SportContext = createContext<SportContextValue | null>(null)

export function SportProvider({ children }: { children: React.ReactNode }) {
  const [sport, setSportState] = useState<SportFilter>("all")

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === "all" || saved === "volleyball" || saved === "football") {
      setSportState(saved)
    }
  }, [])

  const setSport = (next: SportFilter) => {
    setSportState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore write errors (e.g. storage disabled)
    }
  }

  return <SportContext.Provider value={{ sport, setSport }}>{children}</SportContext.Provider>
}

export function useSportFilter() {
  const ctx = useContext(SportContext)
  if (!ctx) throw new Error("useSportFilter must be used within a SportProvider")
  return ctx
}
