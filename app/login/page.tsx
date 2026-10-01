"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AuthShell } from "@/components/shells/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const router = useRouter()
  const [remember, setRemember] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Ошибка входа")
        setIsLoading(false)
        return
      }

      router.push("/venues")
      router.refresh()
    } catch {
      setError("Что-то пошло не так")
      setIsLoading(false)
    }
  }

  return (
    <AuthShell heading="Welcome back" subheading="Sign in to book courts and join sessions.">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            minLength={8}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={remember}
              onCheckedChange={(c) => setRemember(c === true)}
              disabled={isLoading}
            />
            Запомнить меня
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Забыли пароль?
          </Link>
        </div>

        <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Вход...
            </>
          ) : (
            "Войти"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Впервые здесь?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Создать аккаунт
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}