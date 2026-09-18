import { Brain } from "lucide-react"

export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div className="animate-fade-in relative w-full max-w-xs text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <span className="pulse-ring" />
          <span className="pulse-ring" style={{ animationDelay: "0.8s" }} />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
            <Brain className="h-6 w-6 text-primary-bright" />
          </div>
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold tracking-tight">
          TalentSleuth<span className="text-primary-bright">AI</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Loading your intelligence dashboard...</p>
        <div className="relative mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          <div className="shimmer absolute inset-0" />
        </div>
      </div>
    </div>
  )
}
