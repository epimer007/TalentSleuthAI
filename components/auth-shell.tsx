import { Wordmark } from "@/components/wordmark"
import { Aurora } from "@/components/motion"
import { Brain, CheckCircle2 } from "lucide-react"

const assurances = [
  "Resume parsing for PDF, DOCX and TXT",
  "GitHub cross-referencing of claimed skills",
  "Scored dossier with interview questions",
]

/** Split-panel frame shared by the sign-in and register pages. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-12">
      <aside className="relative hidden overflow-hidden border-r border-border px-12 py-10 lg:col-span-5 lg:flex lg:flex-col lg:justify-between">
        <Aurora />
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative">
          <Wordmark />
        </div>
        <div className="relative">
          <div className="animate-float mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-primary/15 shadow-glow">
            <Brain className="h-7 w-7 text-primary-bright" />
          </div>
          <p className="eyebrow-accent mb-4">Talent intelligence workstation</p>
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em]">
            Every claim on a resume, checked against the <span className="text-glow">evidence.</span>
          </h2>
          <ul className="mt-8 space-y-3">
            {assurances.map((item, i) => (
              <li
                key={item}
                className="animate-fade-in-up flex items-center gap-3 text-sm text-muted-foreground"
                style={{ animationDelay: `${300 + i * 120}ms` }}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="eyebrow relative">© 2026 TalentSleuth AI</p>
      </aside>
      <main className="relative flex items-center justify-center overflow-hidden px-4 py-12 lg:col-span-7">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl lg:hidden" aria-hidden="true" />
        <div className="animate-fade-in-up relative w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Wordmark />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
