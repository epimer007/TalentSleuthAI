import Link from "next/link"
import { Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface WordmarkProps {
  href?: string
  className?: string
  /** `ink` when placed on a dark surface. */
  tone?: "paper" | "ink"
}

export function Wordmark({ href = "/", className, tone = "paper" }: WordmarkProps) {
  const accent = tone === "ink" ? "text-primary-bright" : "text-primary"
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        tone === "ink" ? "text-ink-foreground focus-visible:ring-offset-ink" : "text-foreground",
        className,
      )}
    >
      <Brain className={cn("h-7 w-7 transition-transform group-hover:scale-110", accent)} />
      <span className="font-display text-[1.2rem] font-bold leading-none tracking-tight">
        TalentSleuth<span className={accent}>AI</span>
      </span>
    </Link>
  )
}
