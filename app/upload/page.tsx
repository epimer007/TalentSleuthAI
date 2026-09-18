"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wordmark } from "@/components/wordmark"
import { CountUp, Spotlight, Aurora } from "@/components/motion"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Mail,
  MapPin,
  Briefcase,
  Github,
  Linkedin,
  Star,
  Download,
  Target,
  ExternalLink,
  ShieldCheck,
  Zap,
  MessageSquareText,
  ListChecks,
  Brain,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { analyzeResumeAction, ErrorCode } from "@/app/actions/analyze-resume"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import type { ParsedResume } from "@/lib/resume-parser"
import type { GitHubData } from "@/lib/github-api"
import type { AIAnalysis } from "@/lib/gemini-ai"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type Step = "UPLOAD" | "ANALYZING" | "RESULTS"

interface AnalysisData {
  resume: ParsedResume
  github: GitHubData | null
  analysis: AIAnalysis
  candidateId: string
}

const steps: { key: Step; label: string; index: string }[] = [
  { key: "UPLOAD", label: "Setup", index: "01" },
  { key: "ANALYZING", label: "Analysis", index: "02" },
  { key: "RESULTS", label: "Results", index: "03" },
]

const tabTriggerClass =
  "relative h-full flex-none rounded-none border-b-2 border-transparent px-1 py-3.5 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"

function GoogleGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.6 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"/>
      <path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 17.1 19.2 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z"/>
      <path fill="#FBBC05" d="M24 44c5.8 0 10.6-1.9 14.1-5.1l-6.5-5.3C29.7 35.6 27 36.5 24 36.5c-5.8 0-10.7-3.9-12.5-9.1l-7 5.4C7.6 39.9 15.2 44 24 44z"/>
      <path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.6 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"/>
    </svg>
  )
}

/** Mono, ruled section heading used throughout the dossier. */
function SectionHeading({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2.5 border-b border-border pb-3 font-display text-lg font-semibold">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary-bright" strokeWidth={2} />
      </span>
      {children}
    </h3>
  )
}

/** Horizontal score bar that grows in on first paint. */
function ScoreBar({ value, delay = 0, className }: { value: number; delay?: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className="bar-grow h-full rounded-full bg-gradient-to-r from-primary to-cyan shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
        style={{ width: `${value}%`, animationDelay: `${delay}ms` }}
      />
    </div>
  )
}

export default function WizardPage() {
  const [step, setStep] = useState<Step>("UPLOAD")
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  
  const { user, signIn } = useAuth()
  const router = useRouter()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit")
        return
      }
      setFile(droppedFile)
      toast.success("Resume uploaded successfully")
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit")
        return
      }
      setFile(selectedFile)
      toast.success("Resume uploaded successfully")
    }
  }

  const startAnalysis = async () => {
    if (!file || !jobDescription.trim()) {
      toast.error("Please provide both a resume and a job description")
      return
    }

    setStep("ANALYZING")
    setProgress(10)
    setErrorCode(null)
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("resume", file)
      formData.append("jobDescription", jobDescription)

      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 5))
      }, 800)

      const result = await analyzeResumeAction(formData)
      clearInterval(progressInterval)
      setProgress(100)

      if (result.success && result.data) {
        setAnalysisData(result.data as AnalysisData)
        setStep("RESULTS")
        toast.success("Analysis complete!")
      } else {
        setErrorCode(result.code as ErrorCode || "UNEXPECTED_ERROR")
        setErrorMessage(result.error || "An unexpected error occurred.")
        setStep("UPLOAD")
      }
    } catch (err: any) {
      console.error("Wizard analysis error:", err)
      setErrorCode("UNEXPECTED_ERROR")
      setErrorMessage(err.message || "Failed to connect to analysis service.")
      setStep("UPLOAD")
    }
  }

  const resetWizard = () => {
    setStep("UPLOAD")
    setFile(null)
    setJobDescription("")
    setAnalysisData(null)
    setErrorCode(null)
    setErrorMessage("")
    setProgress(0)
  }

  const handleDownloadReport = () => {
    if (!analysisData) return

    const { resume, analysis } = analysisData
    const doc = new jsPDF()

    let y = 15
    doc.setFontSize(18)
    doc.text("TalentSleuth AI - Candidate Analysis Report", 105, y, { align: "center" })
    y += 12

    doc.setFontSize(14)
    doc.text(`Name: ${resume.name || "N/A"}`, 14, y)
    y += 8
    doc.text(`Email: ${resume.email || "N/A"}`, 14, y)
    y += 12

    doc.setFontSize(13)
    doc.text("Analysis Summary:", 14, y)
    y += 6
    doc.setFontSize(11)
    const summaryLines = doc.splitTextToSize(analysis.summary, 180)
    doc.text(summaryLines, 20, y)
    y += summaryLines.length * 6 + 10

    autoTable(doc, {
      startY: y,
      head: [["Category", "Score"]],
      body: [
        ["Overall Match", `${analysis.overallScore}/100`],
        ["Technical Skills", `${analysis.technicalSkillsScore}%`],
        ["Experience Fit", `${analysis.experienceScore}%`],
        ["Profile Completeness", `${analysis.profileCompletenessScore}%`],
        ["Data Consistency", `${analysis.dataConsistencyScore}%`],
      ],
      theme: "striped",
    })

    doc.save(`TalentSleuth_Analysis_${resume.name?.replace(/\s+/g, '_') || 'Report'}.pdf`)
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
        <Aurora />
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="glass-strong animate-fade-in-up relative w-full max-w-sm rounded-2xl p-8">
          <Wordmark />
          <div className="mt-8 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary-bright" />
            <p className="eyebrow">Restricted workstation</p>
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold">Secure access</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Please sign in to access the talent analysis workstation.
          </p>
          <Button onClick={signIn} className="btn-glow mt-6 h-11 w-full rounded-full text-base font-medium">
            <GoogleGlyph />
            Sign in with Google
          </Button>
          <Link href="/" className="mt-5 block text-center text-sm text-muted-foreground transition-colors hover:text-primary-bright">
            Return to landing page
          </Link>
        </div>
      </div>
    )
  }

  const activeIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Wordmark />
          <div className="flex items-center gap-6">
            <ol className="hidden items-center gap-5 md:flex" aria-label="Progress">
              {steps.map((s, i) => {
                const state = i < activeIndex ? "done" : i === activeIndex ? "current" : "todo"
                return (
                  <li key={s.key} className="flex items-center gap-2.5" aria-current={state === "current" ? "step" : undefined}>
                    <span className="relative flex h-2 w-2 items-center justify-center">
                      {state === "current" && <span className="pulse-ring" />}
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors duration-500",
                          state === "current"
                            ? "bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
                            : state === "done"
                              ? "bg-success"
                              : "bg-border",
                        )}
                      />
                    </span>
                    <span className={cn("figure text-[11px]", state === "todo" ? "text-muted-foreground/60" : "text-muted-foreground")}>
                      {s.index}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors duration-500",
                        state === "current" ? "text-foreground" : "text-muted-foreground/60",
                      )}
                    >
                      {s.label}
                    </span>
                    {i < steps.length - 1 && <span className="ml-3 h-px w-6 bg-border" aria-hidden="true" />}
                  </li>
                )
              })}
            </ol>
            {analysisData && (
              <Button variant="outline" size="sm" onClick={resetWizard} className="rounded-full bg-secondary/60 font-medium">
                New Analysis
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container relative mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        {step === "UPLOAD" && (
          <div>
            <div className="animate-fade-in-up mb-10 max-w-2xl">
              <p className="eyebrow-accent mb-4">01 · Setup</p>
              <h1 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">Analyze candidate fitness</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Upload a professional resume and job description for an AI-powered multidimensional assessment.
              </p>
            </div>

            {errorCode && (
              <div role="alert" className="animate-fade-in-up mb-8 flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                <div>
                  <h4 className="font-semibold text-danger">
                    {errorCode === "QUOTA_EXCEEDED" ? "AI API limit reached" : "Analysis interrupted"}
                  </h4>
                  <p className="mt-0.5 text-sm text-foreground/80">{errorMessage}</p>
                  {errorCode === "QUOTA_EXCEEDED" && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Tip: Free tier limits reset periodically. Try again in 5-10 minutes or use a different resume.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-2">
              {/* File Upload Section */}
              <div className="animate-fade-in-up space-y-3" style={{ animationDelay: "120ms" }}>
                <Label htmlFor="file-upload" className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-primary-bright" />
                  Candidate resume
                </Label>
                <div
                  className={cn(
                    "glass group relative cursor-pointer overflow-hidden rounded-2xl p-10 text-center transition-all duration-300",
                    dragActive
                      ? "!border-primary shadow-glow"
                      : file
                        ? "!border-success/50"
                        : "hover:!border-primary/60",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/15 to-transparent transition-opacity duration-300",
                      dragActive ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                    )}
                    aria-hidden="true"
                  />
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  {file ? (
                    <div className="animate-fade-in-up relative space-y-3">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-success/40 bg-success/15 shadow-[0_0_24px_hsl(var(--success)/0.35)]">
                        <CheckCircle className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="mx-auto max-w-xs truncate font-semibold">{file.name}</p>
                        <p className="figure mt-1 text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB · ready</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation()
                          setFile(null)
                        }}
                        className="rounded-full text-danger hover:bg-danger/10 hover:text-danger"
                      >
                        Remove file
                      </Button>
                    </div>
                  ) : (
                    <div className="relative space-y-4">
                      <div className="animate-float mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
                        <Upload className="h-5 w-5 text-primary-bright" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold">Click to upload or drag &amp; drop</p>
                        <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description Section */}
              <div className="animate-fade-in-up space-y-3" style={{ animationDelay: "200ms" }}>
                <Label htmlFor="job-description" className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="h-4 w-4 text-primary-bright" />
                  Target job description
                </Label>
                <div className="relative">
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job requirements, responsibilities, and qualifications here..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    className="glass min-h-[236px] resize-none rounded-2xl p-4 pb-14 text-sm leading-relaxed transition-shadow focus-visible:ring-primary/60 focus-visible:ring-offset-0 focus-visible:shadow-glow"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-full bg-secondary/80 text-xs font-medium"
                      onClick={() => setJobDescription("Software Engineer - 3+ years experience in React, Node.js, and TypeScript. Experience with cloud infrastructure (AWS/GCP) preferred.")}
                    >
                      Sample Tech
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up mt-10 flex flex-col gap-5 border-t border-border pt-8 md:flex-row md:items-center md:justify-between" style={{ animationDelay: "280ms" }}>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <li className={cn("flex items-center gap-2 transition-colors", file ? "text-foreground" : "text-muted-foreground")}>
                  <CheckCircle className={cn("h-4 w-4 transition-colors", file ? "text-success" : "text-border")} />
                  Resume attached
                </li>
                <li className={cn("flex items-center gap-2 transition-colors", jobDescription.trim() ? "text-foreground" : "text-muted-foreground")}>
                  <CheckCircle className={cn("h-4 w-4 transition-colors", jobDescription.trim() ? "text-success" : "text-border")} />
                  Job description provided
                </li>
              </ul>
              <Button
                size="lg"
                onClick={startAnalysis}
                disabled={!file || !jobDescription.trim()}
                className="btn-glow h-12 rounded-full px-8 text-base font-medium disabled:shadow-none"
              >
                <Zap className="mr-1 h-4 w-4" />
                Analyze Candidate Fit
              </Button>
            </div>
          </div>
        )}

        {step === "ANALYZING" && (
          <div className="animate-fade-in-up relative mx-auto max-w-2xl py-16">
            <div className="absolute -inset-10 rounded-[3rem] bg-primary/15 blur-3xl" aria-hidden="true" />
            <div className="glass-strong relative overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-border px-6 py-3">
                <p className="eyebrow-accent">02 · Analysis in progress</p>
                <p className="figure text-xs text-muted-foreground">{progress}%</p>
              </div>
              <div className="space-y-8 p-8">
                <div className="flex items-start gap-6">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                    <span className="pulse-ring" />
                    <span className="pulse-ring" style={{ animationDelay: "0.8s" }} />
                    <span className="pulse-ring" style={{ animationDelay: "1.6s" }} />
                    <span className="animate-orbit absolute inset-0" aria-hidden="true">
                      <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_10px_hsl(var(--cyan))]" />
                    </span>
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
                      <Brain className="h-6 w-6 text-primary-bright" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-display text-2xl font-bold">Conducting analysis</h2>
                    <p className="text-muted-foreground">Our AI is currently cross-referencing candidate data with job requirements...</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="relative h-full rounded-full bg-gradient-to-r from-primary to-cyan transition-[width] duration-700 [transition-timing-function:var(--ease-out-quint)]"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="shimmer absolute inset-0" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    {["Extracting text", "AI reasoning", "Finalizing"].map((label, i) => {
                      const threshold = [0, 40, 85][i]
                      return (
                        <span key={label} className={cn("eyebrow transition-colors duration-500", progress >= threshold ? "text-primary-bright" : undefined)}>
                          {label}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: ShieldCheck, label: "Verification", at: 15 },
                    { icon: Target, label: "Matching", at: 50 },
                    { icon: Star, label: "Scoring", at: 85 },
                  ].map(({ icon: Icon, label, at }) => {
                    const active = progress >= at
                    return (
                      <div
                        key={label}
                        className={cn(
                          "rounded-xl border p-3 text-center transition-all duration-500",
                          active ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.25)]" : "border-border bg-background/40",
                        )}
                      >
                        <Icon className={cn("mx-auto mb-1.5 h-4 w-4 transition-colors duration-500", active ? "text-primary-bright" : "text-muted-foreground/60")} />
                        <span className={cn("eyebrow transition-colors duration-500", active ? "text-foreground" : undefined)}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "RESULTS" && analysisData && (
          <div className="animate-fade-in-up space-y-6">
            {/* Candidate dossier */}
            <div className="glass-strong overflow-hidden rounded-2xl">
              {/* Identity strip */}
              <div className="relative overflow-hidden border-b border-border px-6 py-8 md:px-8">
                <Aurora className="opacity-60" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-cyan opacity-70 blur-sm" aria-hidden="true" />
                    <Avatar className="relative h-20 w-20 border-2 border-background bg-secondary md:h-24 md:w-24">
                      <AvatarImage src={analysisData.github?.profile.avatar_url || ""} />
                      <AvatarFallback className="bg-secondary font-display text-2xl font-bold">
                        {analysisData.resume.name?.split(" ").map(n => n[0]).join("") || "??"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="eyebrow-accent mb-2">Candidate dossier</p>
                    <h1 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">{analysisData.resume.name}</h1>
                    <p className="mt-1 text-base text-primary-bright">{analysisData.resume.experience[0]?.position || "Candidate Profile"}</p>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      {analysisData.resume.email && (
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {analysisData.resume.email}
                        </span>
                      )}
                      {(analysisData.resume.location || analysisData.github?.profile.location) && (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {analysisData.resume.location || analysisData.github?.profile.location}
                        </span>
                      )}
                      <span className="figure flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        ID {analysisData.candidateId.split('-')[1]}
                      </span>
                    </div>
                  </div>

                  <div className="glass flex shrink-0 items-stretch divide-x divide-border rounded-xl">
                    <div className="px-6 py-4 text-center">
                      <CountUp value={analysisData.analysis.overallScore} className="figure text-4xl font-semibold leading-none text-glow" />
                      <div className="eyebrow mt-2">Global score</div>
                    </div>
                    <div className="px-6 py-4 text-center">
                      <CountUp value={analysisData.analysis.roleMatchScore} suffix="%" className="figure text-4xl font-semibold leading-none" />
                      <div className="eyebrow mt-2">Role fit</div>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <div className="overflow-x-auto border-b border-border px-6 md:px-8">
                  <TabsList className="-mb-px h-auto justify-start gap-6 rounded-none bg-transparent p-0">
                    <TabsTrigger value="overview" className={tabTriggerClass}>Overview</TabsTrigger>
                    <TabsTrigger value="matching" className={tabTriggerClass}>Role Matching</TabsTrigger>
                    <TabsTrigger value="platforms" className={tabTriggerClass}>Technical Profile</TabsTrigger>
                    <TabsTrigger value="insights" className={tabTriggerClass}>AI Insights</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6 md:p-8">
                  {/* Overview Content */}
                  <TabsContent value="overview" className="animate-fade-in-up mt-0 space-y-10">
                    <div className="grid gap-10 lg:grid-cols-2">
                      <div className="space-y-6">
                        <SectionHeading icon={Star}>Core dimensions</SectionHeading>
                        <div className="space-y-5">
                          {[
                            { label: "Technical Proficiency", value: analysisData.analysis.technicalSkillsScore },
                            { label: "Experience Relevance", value: analysisData.analysis.experienceScore },
                            { label: "Profile Integrity", value: analysisData.analysis.dataConsistencyScore },
                            { label: "Market Competitiveness", value: analysisData.analysis.profileCompletenessScore }
                          ].map((stat, i) => (
                            <div key={stat.label}>
                              <div className="mb-2 flex items-baseline justify-between">
                                <span className="text-sm font-medium">{stat.label}</span>
                                <CountUp value={stat.value} suffix="%" className="figure text-sm font-semibold" />
                              </div>
                              <ScoreBar value={stat.value} delay={150 + i * 100} />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <SectionHeading icon={ShieldCheck}>Professional summary</SectionHeading>
                        <blockquote className="border-l-2 border-primary pl-5 text-[15px] leading-relaxed text-foreground/85">
                          {analysisData.analysis.summary}
                        </blockquote>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.resume.skills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="rounded-md border-border bg-secondary/60 px-2.5 py-1 font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <SectionHeading icon={Briefcase}>Experience timeline</SectionHeading>
                      <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                        {analysisData.resume.experience.map((exp, i) => (
                          <li key={i} className="flex flex-col gap-2 p-5 transition-colors hover:bg-secondary/40 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                              <h4 className="font-semibold">{exp.position}</h4>
                              <p className="text-sm text-muted-foreground">{exp.company} · <span className="figure">{exp.duration}</span></p>
                            </div>
                            <Badge className="w-fit border border-success/30 bg-success/10 text-success shadow-none hover:bg-success/15">
                              <CheckCircle className="mr-1 h-3 w-3" /> Verified
                            </Badge>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </TabsContent>

                  {/* Matching Content */}
                  <TabsContent value="matching" className="animate-fade-in-up mt-0 space-y-10">
                    <div className="glass relative flex flex-col items-center gap-8 overflow-hidden rounded-2xl p-8 md:flex-row">
                      <div className="relative h-40 w-40 shrink-0">
                        <div className="absolute inset-4 rounded-full bg-primary/20 blur-xl" aria-hidden="true" />
                        <svg className="relative h-full w-full -rotate-90" viewBox="0 0 160 160">
                          <defs>
                            <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="hsl(var(--cyan))" />
                            </linearGradient>
                          </defs>
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-secondary" />
                          <circle
                            cx="80" cy="80" r="70" stroke="url(#ringGradient)" strokeWidth="10" fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray={440}
                            strokeDashoffset={440 - (440 * analysisData.analysis.roleMatchScore) / 100}
                            className="ring-draw"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <CountUp value={analysisData.analysis.roleMatchScore} suffix="%" className="figure text-3xl font-semibold" />
                          <span className="eyebrow mt-1">Match index</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-display text-2xl font-bold">Job compatibility analysis</h3>
                        <p className="max-w-xl leading-relaxed text-muted-foreground">
                          The candidate shows a high degree of alignment with the target role. Technical skills match
                          <span className="figure font-semibold text-primary-bright"> {analysisData.analysis.technicalSkillsScore}% </span>
                          of requirements, while prior experience directly translates to
                          <span className="figure font-semibold text-primary-bright"> {analysisData.analysis.experienceScore}% </span>
                          of core responsibilities.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-10 md:grid-cols-2">
                      <div className="space-y-6">
                        <SectionHeading icon={Target}>Skill alignment</SectionHeading>
                        <div className="space-y-4">
                          {Object.entries(analysisData.analysis.skillAlignment).map(([skill, score], i) => (
                            <div key={skill}>
                              <div className="mb-2 flex items-baseline justify-between">
                                <span className="text-sm font-medium">{skill}</span>
                                <span className="figure text-sm font-semibold text-primary-bright">{score}%</span>
                              </div>
                              <ScoreBar value={score} delay={100 + i * 80} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="glass-strong relative space-y-6 overflow-hidden rounded-2xl p-7">
                        <Aurora className="opacity-50" />
                        <div className="relative space-y-6">
                          <p className="eyebrow-accent">Strategic recommendation</p>
                          <p className="text-lg font-medium leading-relaxed">
                            {analysisData.analysis.summary}
                          </p>
                          <div className="flex flex-col gap-3 pt-2">
                            {analysisData.analysis.recommendations.slice(0, 2).map((rec, i) => (
                              <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-4">
                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                <span className="text-sm text-foreground/85">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Platforms Content */}
                  <TabsContent value="platforms" className="animate-fade-in-up mt-0 space-y-10">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Spotlight className="glass space-y-4 rounded-2xl p-5">
                        <h4 className="relative flex items-center gap-2 text-sm font-semibold">
                          <Github className="h-4 w-4" /> GitHub verification
                        </h4>
                        {analysisData.github ? (
                          <div className="relative space-y-4">
                            <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2">
                              <span className="text-xs font-semibold text-success">Connected</span>
                              <CheckCircle className="h-4 w-4 text-success" />
                            </div>
                            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-center">
                              <div className="bg-background/60 p-2.5">
                                <div className="figure text-lg font-semibold leading-none">{analysisData.github.profile.public_repos}</div>
                                <div className="eyebrow mt-1.5">Repos</div>
                              </div>
                              <div className="bg-background/60 p-2.5">
                                <div className="figure text-lg font-semibold leading-none">{analysisData.github.profile.followers}</div>
                                <div className="eyebrow mt-1.5">Followers</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 w-full rounded-full bg-secondary/60 text-xs font-medium" asChild>
                              <a href={analysisData.github.profile.html_url} target="_blank" rel="noopener noreferrer">
                                Full Code Profile <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="relative rounded-lg border border-dashed border-input p-4 text-center">
                            <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
                            <p className="eyebrow">Profile not found</p>
                          </div>
                        )}
                      </Spotlight>

                      <Spotlight className="glass space-y-4 rounded-2xl p-5">
                        <h4 className="relative flex items-center gap-2 text-sm font-semibold">
                          <Linkedin className="h-4 w-4" /> LinkedIn status
                        </h4>
                        {analysisData.resume.linkedinUrl ? (
                          <div className="relative space-y-4">
                            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                              <span className="text-xs font-semibold text-primary-bright">Linked</span>
                              <CheckCircle className="h-4 w-4 text-primary-bright" />
                            </div>
                            <Button variant="outline" size="sm" className="h-8 w-full rounded-full bg-secondary/60 text-xs font-medium" asChild>
                              <a href={analysisData.resume.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                Open Network Profile <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="relative rounded-lg border border-dashed border-input p-4 text-center">
                            <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
                            <p className="eyebrow">Link unavailable</p>
                          </div>
                        )}
                      </Spotlight>

                      <Spotlight className="glass space-y-4 rounded-2xl p-5">
                        <h4 className="relative flex items-center gap-2 text-sm font-semibold">
                          <ExternalLink className="h-4 w-4" /> Web portfolio
                        </h4>
                        {analysisData.resume.portfolioUrl ? (
                          <div className="relative space-y-4">
                            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                              <span className="text-xs font-semibold text-primary-bright">Available</span>
                              <CheckCircle className="h-4 w-4 text-primary-bright" />
                            </div>
                            <Button variant="outline" size="sm" className="h-8 w-full rounded-full bg-secondary/60 text-xs font-medium" asChild>
                              <a href={analysisData.resume.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                View Digital Work <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="relative rounded-lg border border-dashed border-input p-4 text-center">
                            <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
                            <p className="eyebrow">No URL found</p>
                          </div>
                        )}
                      </Spotlight>
                    </div>

                    {analysisData.github && analysisData.github.repositories.length > 0 && (
                      <div className="space-y-6">
                        <SectionHeading icon={Zap}>Recent technical repositories</SectionHeading>
                        <div className="grid gap-4 md:grid-cols-2">
                          {analysisData.github.repositories.slice(0, 4).map((repo, i) => (
                            <Spotlight key={i} className="glass group rounded-2xl p-5 transition-transform duration-500 [transition-timing-function:var(--ease-out-quint)] hover:-translate-y-0.5">
                              <div className="relative mb-3 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="truncate font-semibold transition-colors group-hover:text-primary-bright">{repo.name}</h4>
                                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{repo.description || "No description provided."}</p>
                                </div>
                                <div className="figure flex shrink-0 items-center rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
                                  <Star className="mr-1 h-3 w-3 fill-warning text-warning" />
                                  {repo.stargazers_count}
                                </div>
                              </div>
                              <div className="relative flex items-center justify-between">
                                <Badge variant="secondary" className="rounded-md font-mono text-[10px] font-medium">
                                  {repo.language || "Other"}
                                </Badge>
                                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary-bright hover:underline">
                                  Source →
                                </a>
                              </div>
                            </Spotlight>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Insights Content */}
                  <TabsContent value="insights" className="animate-fade-in-up mt-0 space-y-10">
                    <div className="grid gap-10 md:grid-cols-2">
                      <div className="space-y-6">
                        <SectionHeading icon={CheckCircle}>Critical strengths</SectionHeading>
                        <ol className="space-y-3">
                          {analysisData.analysis.strengths.map((s, i) => (
                            <li key={i} className="animate-fade-in-up flex items-start gap-4 rounded-xl border border-success/25 bg-success/5 p-4" style={{ animationDelay: `${i * 80}ms` }}>
                              <span className="figure mt-0.5 text-xs font-semibold text-success">{String(i + 1).padStart(2, "0")}</span>
                              <p className="text-sm leading-relaxed">{s}</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="space-y-6">
                        <SectionHeading icon={AlertTriangle}>Potential concerns</SectionHeading>
                        <div className="space-y-3">
                          {analysisData.analysis.redFlags.length > 0 ? (
                            analysisData.analysis.redFlags.map((f, i) => (
                              <div key={i} className="animate-fade-in-up flex items-start gap-4 rounded-xl border border-danger/25 bg-danger/5 p-4" style={{ animationDelay: `${i * 80}ms` }}>
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                                <p className="text-sm leading-relaxed">{f}</p>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed border-input p-8 text-center">
                              <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                              <p className="eyebrow">No significant concerns found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-10 md:grid-cols-2">
                      <div className="space-y-6">
                        <SectionHeading icon={ListChecks}>Hiring recommendations</SectionHeading>
                        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                          {analysisData.analysis.recommendations.map((r, i) => (
                            <li key={i} className="flex items-start gap-3 p-4 text-sm transition-colors hover:bg-secondary/40">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" aria-hidden="true" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-6">
                        <SectionHeading icon={MessageSquareText}>Targeted interview questions</SectionHeading>
                        <ol className="space-y-3">
                          {analysisData.analysis.interviewQuestions.map((q, i) => (
                            <li key={i} className="glass animate-fade-in-up flex items-start gap-4 rounded-xl p-4" style={{ animationDelay: `${i * 80}ms` }}>
                              <span className="figure mt-0.5 text-xs text-primary-bright">Q{i + 1}</span>
                              <p className="text-sm font-medium leading-relaxed">{q}</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Footer Action Bar */}
            <div className="glass-strong sticky bottom-6 flex flex-col items-center justify-between gap-4 rounded-2xl p-4 md:flex-row">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={resetWizard} className="rounded-full bg-secondary/60 font-medium">
                  Start New Assessment
                </Button>
                <div className="hidden h-6 w-px bg-border md:block" />
                <p className="figure hidden text-xs text-muted-foreground md:block">
                  Candidate ID: {analysisData.candidateId}
                </p>
              </div>
              <Button onClick={handleDownloadReport} className="btn-glow w-full rounded-full font-medium md:w-auto">
                <Download className="mr-1 h-4 w-4" />
                Download Dossier (PDF)
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 md:flex-row md:items-center">
          <Wordmark />
          <p className="eyebrow">© 2026 TalentSleuth AI Workstation · Confidential intelligence</p>
        </div>
      </footer>
    </div>
  )
}
