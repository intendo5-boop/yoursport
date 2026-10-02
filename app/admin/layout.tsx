import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (!session.roles.includes("admin")) {
    redirect("/dashboard")
  }

  return <>{children}</>
}