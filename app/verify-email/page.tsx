import { MailCheck } from "lucide-react"
import { AuthShell } from "@/components/shells/auth-shell"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"

export default function VerifyEmailPage() {
  return (
    <AuthShell heading="Verify your email">
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-8" />
        </span>
        <div>
          <p className="text-lg font-semibold">Check your inbox</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">you@email.com</span>. Click the link to
            activate your account and finish setting up your profile.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <ButtonLink size="lg" href="/onboarding" className="h-11 w-full text-base">
            I&apos;ve verified — continue
          </ButtonLink>
          <Button variant="ghost" size="lg" className="w-full">
            Resend email
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Wrong address?{" "}
          <a href="/register" className="font-medium text-primary hover:underline">
            Go back
          </a>
        </p>
      </div>
    </AuthShell>
  )
}
