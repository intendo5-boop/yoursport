"use client"

import { SportProvider } from "./sport-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SportProvider>{children}</SportProvider>
}