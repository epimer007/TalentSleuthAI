"use client"

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react"
import { cn } from "@/lib/utils"

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Scroll reveal. Content is rendered visible (SSR-safe); after mount, only
 * elements still below the fold are hidden and revealed on intersection.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  style,
}: {
  children: ReactNode
  className?: string
  delay?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return

    el.classList.add("reveal-hidden")
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("reveal-visible")
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

/** Counts from 0 to `value` after mount; renders the final value on the server. */
export function CountUp({
  value,
  duration = 1400,
  suffix = "",
  className,
}: {
  value: number
  duration?: number
  suffix?: string
  className?: string
}) {
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (reducedMotion()) {
      setDisplay(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 4)
      setDisplay(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    setDisplay(0)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  )
}

/** Card with a cursor-following spotlight (CSS handles the visuals via --x/--y). */
export function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--x", `${e.clientX - r.left}px`)
    el.style.setProperty("--y", `${e.clientY - r.top}px`)
  }
  return (
    <div ref={ref} onMouseMove={onMove} className={cn("spotlight", className)}>
      {children}
    </div>
  )
}

/** Subtle 3D tilt toward the cursor, easing back on leave. */
export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(1100px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-2px)`
  }
  const onLeave = () => {
    const el = ref.current
    if (el) el.style.transform = ""
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("transition-transform duration-500 [transition-timing-function:var(--ease-out-quint)] will-change-transform", className)}
    >
      {children}
    </div>
  )
}

/** Decorative aurora background: three drifting, blurred colour fields. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cn("aurora-field pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div className="aurora aurora-primary -top-32 left-[-8%] h-[32rem] w-[40rem]" />
      <div className="aurora aurora-cyan -top-10 right-[-6%] h-[26rem] w-[30rem]" />
      <div className="aurora aurora-deep left-[30%] top-[30%] h-[24rem] w-[36rem]" />
      <div className="grain absolute inset-0" />
    </div>
  )
}
