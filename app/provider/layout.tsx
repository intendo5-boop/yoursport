import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (!session.roles?.includes("provider")) {
    redirect("/dashboard")
  }

  return <>{children}</>
}