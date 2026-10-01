import { Volleyball, Goal, Star } from "lucide-react"
import { Logo } from "@/components/logo"

export function AuthShell({
  children,
  heading,
  subheading,
}: {
  children: React.ReactNode
  heading: string
  subheading?: string
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <img
          src="/venues/football-pitch.png"
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="relative">
          <Logo href="/" className="[&_span:last-child]:text-primary-foreground" />
        </div>
        <div className="relative flex flex-col gap-6">
          <div className="flex gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Volleyball className="size-6" />
            </span>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Goal className="size-6" />
            </span>
          </div>
          <h2 className="max-w-sm text-3xl font-bold leading-tight text-balance">
            Play more volleyball and football.
          </h2>
          <p className="max-w-sm text-primary-foreground/80">
            Book courts, join coach-led training, and organize games — all in one place.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/90">
            <Star className="size-4 fill-white text-white" />
            Trusted by 8,000+ players and 200+ providers
          </div>
        </div>
        <div className="relative text-xs text-primary-foreground/70">
          Rally — a two-sided sports marketplace prototype.
        </div>
      </div>

      <div className="flex w-full flex-col lg:w-1/2">
        <div className="p-6 lg:hidden">
          <Logo href="/" />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
            {subheading && <p className="mt-1.5 text-muted-foreground">{subheading}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
