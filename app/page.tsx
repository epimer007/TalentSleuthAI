"use client"

import { Button } from "@/components/ui/button"
import { Wordmark } from "@/components/wordmark"
import { Reveal, CountUp, Spotlight, TiltCard, Aurora } from "@/components/motion"
import {
  Target,
  Users,
  FileText,
  AlertTriangle,
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Github,
  Brain,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: FileText,
    title: "Deep document parsing",
    desc: "Extracts nuanced technical skills and experience timelines from complex PDF and DOCX formats.",
  },
  {
    icon: ShieldCheck,
    title: "Platform verification",
    desc: "Cross-references claimed skills with actual open-source contributions on GitHub and digital portfolios.",
  },
  {
    icon: Target,
    title: "Semantic role matching",
    desc: "Evaluates candidate fitness against specific job descriptions using advanced semantic similarity.",
  },
  {
    icon: AlertTriangle,
    title: "Anomaly detection",
    desc: "Automatically flags employment gaps, skill inconsistencies, and missing professional links.",
  },
  {
    icon: Sparkles,
    title: "Generative insights",
    desc: "Provides a synthesized summary of the candidate's strengths and tailored interview questions.",
  },
  {
    icon: Users,
    title: "Standardized reporting",
    desc: "Generates consistent, bias-reduced PDF dossiers for equitable team evaluation.",
  },
]

const phases = [
  { step: "01", title: "Ingestion", desc: "Upload candidate documents and define the target job requirements." },
  { step: "02", title: "Extraction", desc: "AI parses raw data into a structured schema of skills and history." },
  { step: "03", title: "Enrichment", desc: "The system fetches real-time data from GitHub to verify technical claims." },
  { step: "04", title: "Synthesis", desc: "Gemini models evaluate the aggregated data and generate a comprehensive dossier." },
]

/* Illustrative output shown in the hero. Figures are examples, not a real candidate. */
const sampleDossier = {
  name: "Sample candidate",
  role: "Senior Backend Engineer",
  overall: 84,
  roleFit: 88,
  dims: [
    { label: "Technical", value: 91 },
    { label: "Experience", value: 79 },
    { label: "Integrity", value: 96 },
  ],
  skills: [
    { name: "Go", score: 92 },
    { name: "Kubernetes", score: 85 },
    { name: "PostgreSQL", score: 78 },
  ],
  flag: "18-month gap (2021–22) not explained in resume",
}

const stagger = (i: number) => ({ animationDelay: `${120 + i * 110}ms` })

export default function HomePage() {
  const { user, logout, signIn } = useAuth()
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleProtectedNav = (path: string) => {
    if (user) {
      router.push(path)
    } else {
      router.push("/signin")
    }
  }

  const handleSignIn = () => {
    signIn()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled ? "border-border bg-background/70 backdrop-blur-xl" : "border-transparent bg-transparent",
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Wordmark />

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { label: "Platform Features", href: "#features" },
              { label: "Methodology", href: "#how-it-works" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <button
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              onClick={() => handleProtectedNav("/upload")}
            >
              Analysis Studio
            </button>
          </nav>

          {/* Auth Controls */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">{user.displayName}</span>
                <Button variant="outline" onClick={logout} className="h-9 rounded-full bg-secondary/60 px-4 text-sm font-medium">
                  Sign Out
                </Button>
                <Button onClick={() => router.push("/upload")} className="btn-glow h-9 rounded-full px-4 text-sm font-medium">
                  Dashboard <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleSignIn} className="btn-glow h-9 rounded-full px-5 text-sm font-medium">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileNavOpen && (
          <div className="animate-fade-in space-y-4 border-b border-border bg-background/95 px-4 py-4 backdrop-blur-xl md:hidden">
            <Link href="#features" className="block text-sm font-medium" onClick={() => setMobileNavOpen(false)}>Features</Link>
            <Link href="#how-it-works" className="block text-sm font-medium" onClick={() => setMobileNavOpen(false)}>Methodology</Link>
            <button className="block w-full text-left text-sm font-medium" onClick={() => { setMobileNavOpen(false); handleProtectedNav("/upload"); }}>Analysis Studio</button>
            <div className="border-t border-border pt-4">
              {user ? (
                <Button variant="outline" className="w-full rounded-full bg-secondary/60" onClick={() => { setMobileNavOpen(false); logout(); }}>Sign Out</Button>
              ) : (
                <Button className="btn-glow w-full rounded-full" onClick={() => { setMobileNavOpen(false); handleSignIn(); }}>Sign In</Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative -mt-16 overflow-hidden pt-16">
        <Aurora />
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container relative mx-auto grid items-center gap-16 px-4 py-24 lg:grid-cols-12 lg:py-32">
          <div className="lg:col-span-6">
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 py-1 pl-1.5 pr-3.5 backdrop-blur" style={stagger(0)}>
              <span className="flex h-5 items-center rounded-full bg-primary/20 px-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary-bright">New</span>
              <span className="text-xs font-medium text-muted-foreground">Enterprise talent intelligence</span>
            </div>
            <h1 className="animate-fade-in-up mt-7 font-display text-5xl font-bold leading-[1.02] tracking-[-0.03em] md:text-6xl xl:text-7xl" style={stagger(1)}>
              Assess candidate fit with <span className="text-glow">precision.</span>
            </h1>
            <p className="animate-fade-in-up mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl" style={stagger(2)}>
              TalentSleuth AI cross-references resumes with public code repositories and professional networks to deliver an objective, multidimensional assessment of technical candidates.
            </p>
            <div className="animate-fade-in-up mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" style={stagger(3)}>
              <Button
                size="lg"
                className="btn-glow h-12 w-full rounded-full px-7 text-base font-medium sm:w-auto"
                onClick={() => handleProtectedNav("/upload")}
              >
                Start Candidate Analysis <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-border bg-secondary/40 px-7 text-base font-medium backdrop-blur transition-colors hover:bg-secondary sm:w-auto"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Methodology
              </Button>
            </div>
            <ul className="animate-fade-in-up mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground" style={stagger(4)}>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-success" /> PDF &amp; DOCX support</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-success" /> GitHub integration</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-success" /> Bias mitigation</li>
            </ul>
          </div>

          {/* Sample dossier — a still of the product's real output shape */}
          <div className="animate-fade-in-up lg:col-span-6 lg:pl-6" style={stagger(2)}>
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/30 via-cyan/10 to-transparent opacity-60 blur-2xl" aria-hidden="true" />
              <TiltCard className="relative">
                <div className="glass-strong relative overflow-hidden rounded-2xl">
                  <div className="scan-sweep" aria-hidden="true" />
                  <div className="flex items-center justify-between border-b border-border px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary-bright" />
                      <span className="eyebrow">Case file · example output</span>
                    </div>
                    <span className="figure hidden text-[11px] text-muted-foreground sm:block">ID 1726-0421</span>
                  </div>
                  <div className="px-5 pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-xl font-bold leading-tight">{sampleDossier.name}</p>
                        <p className="text-sm text-muted-foreground">{sampleDossier.role}</p>
                      </div>
                      <div className="text-right">
                        <CountUp value={sampleDossier.overall} className="figure text-4xl font-semibold leading-none text-glow" />
                        <p className="eyebrow mt-1">Overall</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-px border-y border-border bg-border sm:grid-cols-4">
                    <div className="bg-card/80 px-4 py-3">
                      <CountUp value={sampleDossier.roleFit} suffix="%" className="figure text-lg font-semibold leading-none" />
                      <p className="eyebrow mt-1.5">Role fit</p>
                    </div>
                    {sampleDossier.dims.map((d) => (
                      <div key={d.label} className="bg-card/80 px-4 py-3">
                        <CountUp value={d.value} suffix="%" className="figure text-lg font-semibold leading-none" />
                        <p className="eyebrow mt-1.5">{d.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 px-5 py-5">
                    <p className="eyebrow">Skill alignment</p>
                    {sampleDossier.skills.map((s, i) => (
                      <div key={s.name} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-medium">{s.name}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="bar-grow h-full rounded-full bg-gradient-to-r from-primary to-cyan"
                            style={{ width: `${s.score}%`, animationDelay: `${400 + i * 120}ms` }}
                          />
                        </div>
                        <span className="figure w-9 text-right text-xs text-muted-foreground">{s.score}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
                    <div className="flex items-center gap-2.5 bg-card/80 px-5 py-3.5 text-sm">
                      <Github className="h-4 w-4 text-success" />
                      <span><span className="font-medium">GitHub verified</span> · 42 repos</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-card/80 px-5 py-3.5 text-sm">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                      <span className="line-clamp-1">{sampleDossier.flag}</span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative scroll-mt-16 border-t border-border py-24">
        <div className="container mx-auto px-4">
          <Reveal className="mb-14 max-w-2xl">
            <p className="eyebrow-accent mb-4">Capabilities</p>
            <h2 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">Technical assessment, automated.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our platform automates the time-consuming process of technical due diligence, providing your hiring team with actionable intelligence.
            </p>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 70}>
                <Spotlight className="glass group h-full rounded-2xl p-7 transition-transform duration-500 [transition-timing-function:var(--ease-out-quint)] hover:-translate-y-1">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary/70 transition-colors group-hover:border-primary/50 group-hover:bg-primary/15">
                    <feature.icon className="h-5 w-5 text-foreground transition-colors group-hover:text-primary-bright" strokeWidth={1.75} />
                  </div>
                  <h3 className="relative mt-6 font-display text-xl font-semibold">{feature.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="how-it-works" className="relative scroll-mt-16 overflow-hidden border-t border-border py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/60 to-transparent" aria-hidden="true" />
        <div className="container mx-auto px-4">
          <Reveal className="mb-14 max-w-2xl">
            <p className="eyebrow-accent mb-4">Methodology</p>
            <h2 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">Four phases, one dossier.</h2>
            <p className="mt-4 text-lg text-muted-foreground">A rigorous pipeline designed to surface the best technical talent.</p>
          </Reveal>

          <div role="list" className="relative grid gap-10 md:grid-cols-4 md:gap-8">
            <div className="absolute left-0 right-0 top-[11px] hidden h-px bg-gradient-to-r from-primary/70 via-border to-border md:block" aria-hidden="true" />
            {phases.map((item, i) => (
              <Reveal key={item.step} delay={i * 110}>
                <div role="listitem" className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="relative z-10 flex h-[23px] w-[23px] items-center justify-center rounded-full border border-primary/60 bg-background" aria-hidden="true">
                      <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
                    </span>
                    <span className="figure text-xs text-muted-foreground">Phase {item.step}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="glass-strong relative overflow-hidden rounded-3xl px-8 py-16 md:px-16">
              <Aurora className="opacity-70" />
              <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-8">
                  <p className="eyebrow-accent mb-4">Get started</p>
                  <h2 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-5xl">Deploy intelligence in your hiring pipeline.</h2>
                  <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                    Reduce screening time by 60% and improve technical hire quality with automated due diligence.
                  </p>
                </div>
                <div className="lg:col-span-4 lg:justify-self-end">
                  <Button
                    size="lg"
                    className="btn-glow h-12 w-full rounded-full px-8 text-base font-medium sm:w-auto"
                    onClick={() => handleProtectedNav("/upload")}
                  >
                    Access the Platform <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto flex flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center">
          <Wordmark />
          <p className="text-sm text-muted-foreground">
            © 2026 Talent Intelligence Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
