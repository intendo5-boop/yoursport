import Link from "next/link"
import {
  Volleyball,
  Goal,
  MapPin,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  Search,
  Star,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { ButtonLink } from "@/components/ui/button-link"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Search,
    title: "Find training & games",
    body: "Browse volleyball and football sessions near you, filter by sport, level and specialization, and see the next available slot at a glance.",
  },
  {
    icon: CalendarDays,
    title: "Join training & games",
    body: "Discover coach-led sessions and pickup games matched to your skill level, with clear spots-left counts and trainer profiles.",
  },
  {
    icon: MapPin,
    title: "Register in seconds",
    body: "Pick a session, add a note, and confirm your spot. Track everything from your personal dashboard.",
  },
]

const explore = [
  { href: "/events", label: "Events catalog", icon: CalendarDays, desc: "Training & games" },
  { href: "/provider", label: "Provider console", icon: Goal, desc: "Manage venues & events" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo href="/events" />
          <div className="flex items-center gap-2">
            <ButtonLink variant="ghost" size="lg" href="/login">
              Sign in
            </ButtonLink>
            <ButtonLink size="lg" href="/register">
              Get started
            </ButtonLink>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
              <Volleyball className="size-4 text-primary" />
              Volleyball & Football, one platform
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Find your game.
              <br />
              <span className="text-primary">Join the session.</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Rally connects players with training providers. Find a session, register for
              coach-led training, and play more — all in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink size="lg" className="h-11 px-6 text-base" href="/events">
                Browse events
                <ArrowRight />
              </ButtonLink>
              <ButtonLink
                variant="outline"
                size="lg"
                className="h-11 px-6 text-base"
                href="/register"
              >
                Get started
              </ButtonLink>
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                Coach-led sessions
              </span>
              <span>Weekly training & games</span>
            </div>
          </div>

          <div className="relative">
            <img
              src="/venues/volleyball-indoor.png"
              alt="Modern indoor volleyball court"
              className="aspect-[4/3] w-full rounded-3xl border border-border object-cover shadow-lg"
            />
            <Card className="absolute -bottom-5 -left-4 hidden w-52 p-4 sm:block">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Goal className="size-4" />
                </span>
                Sunday 7-a-side
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Riverside Park · 2 spots left</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <Card key={f.title} className="p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight">Explore the platform</h2>
          <p className="mt-1 text-muted-foreground">
            Jump into any part of the platform.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {explore.map((e) => {
              const Icon = e.icon
              return (
                <Link
                  key={e.href}
                  href={e.href}
                  className="group flex flex-col gap-3 rounded-2xl border border-border p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1 font-semibold">
                      {e.label}
                      <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                    <p className="text-sm text-muted-foreground">{e.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo href="/events" />
          <p>Rally — sports marketplace.</p>
        </div>
      </footer>
    </div>
  )
}