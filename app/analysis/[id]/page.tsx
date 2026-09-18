"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wordmark } from "@/components/wordmark"
import { CountUp, Spotlight, Aurora } from "@/components/motion"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Mail,
  MapPin,
  Briefcase,
  Github,
  Linkedin,
  AlertTriangle,
  CheckCircle,
  Star,
  Download,
  Target,
  ExternalLink,
  Globe,
  Sparkles,
  MessageSquareText,
  ListChecks,
  Brain,
} from "lucide-react"
import Link from "next/link"
import type { ParsedResume } from "@/lib/resume-parser"
import type { GitHubData } from "@/lib/github-api"
import type { AIAnalysis } from "@/lib/gemini-ai"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface AnalysisData {
  resume: ParsedResume
  github: GitHubData | null
  analysis: AIAnalysis
  candidateId: string
}

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number
      [key: string]: any
    }
  }
}

const tabTriggerClass =
  "relative h-full flex-none rounded-none border-b-2 border-transparent px-1 py-3.5 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"

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

function StatusPanel({
  icon: Icon,
  tone,
  title,
  action,
}: {
  icon: React.ElementType
  tone: "neutral" | "warn" | "danger"
  title: string
  action?: React.ReactNode
}) {
  const color = tone === "danger" ? "text-danger" : tone === "warn" ? "text-warning" : "text-primary-bright"
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <Aurora />
      <div className="glass-strong animate-fade-in-up relative w-full max-w-sm rounded-2xl p-8 text-center">
        <Icon className={`mx-auto mb-4 h-8 w-8 ${color}`} />
        <p className="text-base font-medium">{title}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem("analysisData")
      if (storedData) {
        const data = JSON.parse(storedData)
        setAnalysisData(data)
      } else {
        setError("Network error, reupload the resume.")
      }
    } catch (err: any) {
      // Check for Gemini JSON parse error
      const errMsg = String(err)
      if (
        errMsg.includes("Failed to parse Gemini analysis JSON") ||
        errMsg.includes("SyntaxError")
      ) {
        setError(
          "There was a problem analyzing the resume (invalid or corrupt data received from AI). Please reupload the resume and try again."
        )
      } else {
        setError("Network error, reupload the resume.")
      }
    }
    setLoading(false)
  }, [])

  function handleDownloadReport() {
    if (!analysisData) return

    const { resume, github, analysis } = analysisData
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
    doc.text("Key Skills:", 14, y)
    y += 6
    doc.setFontSize(11)
    const skillsText = doc.splitTextToSize(resume.skills.join(", "), 170)
    doc.text(skillsText, 20, y)
    y += skillsText.length * 6 + 4

    doc.setFontSize(13)
    doc.text("Scores:", 14, y)
    y += 6
    doc.setFontSize(11)
    doc.text(`Overall Score: ${analysis.overallScore}`, 20, y)
    y += 6
    doc.text(`Role Match Score: ${analysis.roleMatchScore}%`, 20, y)
    y += 6
    doc.text(`Technical Skills: ${analysis.technicalSkillsScore}%`, 20, y)
    y += 6
    doc.text(`Experience Level: ${analysis.experienceScore}%`, 20, y)
    y += 6
    doc.text(`Profile Completeness: ${analysis.profileCompletenessScore}%`, 20, y)
    y += 6
    doc.text(`Data Consistency: ${analysis.dataConsistencyScore}%`, 20, y)
    y += 10

    doc.setFontSize(13)
    doc.text("AI Summary:", 14, y)
    y += 6
    doc.setFontSize(11)
    const summaryLines = doc.splitTextToSize(analysis.summary, 180)
    doc.text(summaryLines, 20, y)
    y += summaryLines.length * 6 + 4

    // Strengths Table
    doc.setFontSize(13)
    doc.text("Top Strengths:", 14, y)
    y += 4
    autoTable(doc, {
      startY: y,
      head: [["Strength"]],
      body: analysis.strengths.slice(0, 5).map((s) => [s]),
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 2 },
      headStyles: { fillColor: [46, 204, 113] },
      margin: { left: 20, right: 20 },
    })
    y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 6 : y + 6

    // Red Flags Table
    doc.setFontSize(13)
    doc.text("Red Flags:", 14, y)
    y += 4
    autoTable(doc, {
      startY: y,
      head: [["Red Flag"]],
      body: analysis.redFlags.slice(0, 5).map((f) => [f]),
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 2 },
      headStyles: { fillColor: [231, 76, 60] },
      margin: { left: 20, right: 20 },
    })
    y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 6 : y + 6

    // Work History Table
    doc.setFontSize(13)
    doc.text("Work History:", 14, y)
    y += 4
    autoTable(doc, {
      startY: y,
      head: [["Position", "Company", "Duration"]],
      body: resume.experience.map((job) => [
        job.position,
        job.company,
        job.duration,
      ]),
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 2 },
      margin: { left: 20, right: 20 },
    })
    y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 6 : y + 6

    // --- PAGE BREAK FOR INTERVIEW RECOMMENDATIONS ---
    doc.addPage()
    y = 15

    // Recommendations Table (Page 2)
    doc.setFontSize(13)
    doc.text("Interview Recommendations:", 14, y)
    y += 4
    autoTable(doc, {
      startY: y,
      head: [["Recommendation"]],
      body: analysis.recommendations.map((r) => [r]),
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 2 },
      margin: { left: 20, right: 20 },
    })
    y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 6 : y + 6

    // Interview Questions Table (Page 2)
    doc.setFontSize(13)
    doc.text("Suggested Interview Questions:", 14, y)
    y += 4
    autoTable(doc, {
      startY: y,
      head: [["Question"]],
      body: analysis.interviewQuestions.map((q) => [q]),
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 2 },
      margin: { left: 20, right: 20 },
    })

    doc.save(`talentsleuth-analysis-${analysisData.candidateId || "report"}.pdf`)
  }

  if (loading) {
    return <StatusPanel icon={Brain} tone="neutral" title="Loading analysis..." />
  }

  if (error) {
    return (
      <StatusPanel
        icon={AlertTriangle}
        tone="danger"
        title={error}
        action={
          <Link href="/upload">
            <Button className="btn-glow rounded-full">Reupload Resume</Button>
          </Link>
        }
      />
    )
  }

  if (!analysisData) {
    return (
      <StatusPanel
        icon={AlertTriangle}
        tone="warn"
        title="No analysis data found"
        action={
          <Link href="/upload">
            <Button className="btn-glow rounded-full">Upload New Resume</Button>
          </Link>
        }
      />
    )
  }

  const { resume, github, analysis } = analysisData

  const scoreRows = [
    { label: "Technical Skills", value: analysis.technicalSkillsScore },
    { label: "Experience Level", value: analysis.experienceScore },
    { label: "Profile Completeness", value: analysis.profileCompletenessScore },
    { label: "Data Consistency", value: analysis.dataConsistencyScore },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/upload"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              aria-label="Back to upload"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Wordmark href="/upload" />
          </div>
          <p className="eyebrow-accent">Candidate analysis</p>
        </div>
      </header>

      <div className="container mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {/* Candidate Header */}
        <div className="glass-strong animate-fade-in-up relative mb-8 overflow-hidden rounded-2xl px-6 py-8 md:px-8">
          <Aurora className="opacity-60" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-cyan opacity-70 blur-sm" aria-hidden="true" />
              <Avatar className="relative h-20 w-20 border-2 border-background bg-secondary md:h-24 md:w-24">
                <AvatarImage src={github?.profile.avatar_url || "/placeholder.svg"} alt={resume.name || "Candidate"} />
                <AvatarFallback className="bg-secondary font-display text-2xl font-bold">
                  {resume.name
                    ? resume.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "??"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="min-w-0 flex-1">
              <p className="eyebrow-accent mb-2">Candidate dossier</p>
              <h1 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">{resume.name || "Candidate Name"}</h1>
              <p className="mt-1 text-base text-primary-bright">{resume.experience[0]?.position || "Professional"}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {resume.email && (
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {resume.email}
                  </span>
                )}
                {(resume.location || github?.profile.location) && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {resume.location || github?.profile.location}
                  </span>
                )}
                {resume.experience.length > 0 && (
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="figure">{resume.experience.length}</span> positions
                  </span>
                )}
              </div>
            </div>

            <div className="glass flex w-full shrink-0 items-stretch divide-x divide-border rounded-xl md:w-auto">
              <div className="min-w-0 flex-1 px-4 py-4 text-center md:flex-none md:px-6">
                <CountUp value={analysis.overallScore} className="figure text-4xl font-semibold leading-none text-glow" />
                <div className="eyebrow mt-2">Overall score</div>
              </div>
              <div className="min-w-0 flex-1 px-4 py-4 text-center md:flex-none md:px-6">
                <CountUp value={analysis.roleMatchScore} suffix="%" className="figure text-4xl font-semibold leading-none" />
                <div className="eyebrow mt-2">Role match</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in-up space-y-8" style={{ animationDelay: "120ms" }}>
          <div className="overflow-x-auto border-b border-border">
            <TabsList className="-mb-px h-auto justify-start gap-6 rounded-none bg-transparent p-0">
              <TabsTrigger value="overview" className={tabTriggerClass}>Overview</TabsTrigger>
              <TabsTrigger value="platforms" className={tabTriggerClass}>Platforms</TabsTrigger>
              <TabsTrigger value="matching" className={tabTriggerClass}>Role Matching</TabsTrigger>
              <TabsTrigger value="insights" className={tabTriggerClass}>AI Insights</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="animate-fade-in-up mt-0 space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Score Breakdown */}
              <Spotlight className="glass space-y-5 rounded-2xl p-6">
                <SectionHeading icon={Star}>Score breakdown</SectionHeading>
                <div className="relative space-y-4">
                  {scoreRows.map((row, i) => (
                    <div key={row.label}>
                      <div className="mb-2 flex items-baseline justify-between">
                        <span className="text-sm font-medium">{row.label}</span>
                        <CountUp value={row.value} suffix="%" className="figure text-sm font-semibold" />
                      </div>
                      <ScoreBar value={row.value} delay={150 + i * 100} />
                    </div>
                  ))}
                </div>
              </Spotlight>

              {/* Skills */}
              <Spotlight className="glass space-y-5 rounded-2xl p-6">
                <SectionHeading icon={Target}>Key skills</SectionHeading>
                <div className="relative flex flex-wrap gap-2">
                  {resume.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="rounded-md border-border bg-secondary/60 px-2.5 py-1 font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10">
                      {skill}
                    </Badge>
                  ))}
                  {github &&
                    Object.keys(github.languages).map((language, index) => (
                      <Badge key={`github-${index}`} className="rounded-md border border-success/30 bg-success/10 px-2.5 py-1 font-medium text-success shadow-none hover:bg-success/15">
                        <Github className="mr-1 h-3 w-3" />
                        {language}
                      </Badge>
                    ))}
                </div>
              </Spotlight>

              {/* AI Summary */}
              <Spotlight className="glass space-y-5 rounded-2xl p-6">
                <SectionHeading icon={Sparkles}>AI summary</SectionHeading>
                <p className="relative text-sm leading-relaxed text-foreground/85">{analysis.summary}</p>
                <div className="relative space-y-2">
                  <h4 className="eyebrow flex items-center gap-1.5 text-success">
                    <CheckCircle className="h-3 w-3" />
                    Top strengths
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {analysis.strengths.slice(0, 3).map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-success" aria-hidden="true" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </Spotlight>
            </div>

            {/* Work History */}
            <div className="glass space-y-5 rounded-2xl p-6">
              <SectionHeading icon={Briefcase}>Work history</SectionHeading>
              <ol className="divide-y divide-border">
                {resume.experience.map((job, index) => (
                  <li key={index} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h4 className="font-semibold">{job.position}</h4>
                      <p className="text-sm text-muted-foreground">
                        {job.company} · <span className="figure">{job.duration}</span>
                      </p>
                      {job.description && <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{job.description}</p>}
                    </div>
                    <Badge className="w-fit shrink-0 border border-success/30 bg-success/10 text-success shadow-none hover:bg-success/15">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  </li>
                ))}
                {resume.experience.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No work experience found in resume</p>
                )}
              </ol>
            </div>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="animate-fade-in-up mt-0 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* GitHub */}
              <Spotlight className="glass space-y-4 rounded-2xl p-6">
                <SectionHeading icon={Github}>GitHub profile</SectionHeading>
                {github ? (
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2">
                      <span className="text-xs font-semibold text-success">Profile found</span>
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                      <dt className="text-muted-foreground">Repositories</dt>
                      <dd className="figure font-semibold">{github.profile.public_repos}</dd>
                      <dt className="text-muted-foreground">Followers</dt>
                      <dd className="figure font-semibold">{github.profile.followers}</dd>
                      <dt className="text-muted-foreground">Top languages</dt>
                      <dd className="font-medium">{Object.keys(github.languages).slice(0, 3).join(", ")}</dd>
                    </dl>
                    <Button variant="outline" size="sm" className="w-full rounded-full bg-secondary/60 font-medium" asChild>
                      <a href={github.profile.html_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View Profile
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
                      <span className="text-xs font-semibold text-warning">Profile not found</span>
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {resume.githubUrl ? "Unable to fetch GitHub data" : "No GitHub URL found in resume"}
                    </p>
                  </div>
                )}
              </Spotlight>

              {/* LinkedIn */}
              <Spotlight className="glass space-y-4 rounded-2xl p-6">
                <SectionHeading icon={Linkedin}>LinkedIn profile</SectionHeading>
                <div className="relative space-y-4">
                  {resume.linkedinUrl ? (
                    <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2">
                      <span className="text-xs font-semibold text-success">Profile found</span>
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
                      <span className="text-xs font-semibold text-warning">Profile not found</span>
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    </div>
                  )}
                  {resume.linkedinUrl ? (
                    <Button variant="outline" size="sm" className="w-full rounded-full bg-secondary/60 font-medium" asChild>
                      <a href={resume.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View Profile
                      </a>
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">No LinkedIn URL found in resume</p>
                  )}
                </div>
              </Spotlight>

              {/* Portfolio */}
              <Spotlight className="glass space-y-4 rounded-2xl p-6">
                <SectionHeading icon={Globe}>Portfolio website</SectionHeading>
                <div className="relative space-y-4">
                  {resume.portfolioUrl ? (
                    <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2">
                      <span className="text-xs font-semibold text-success">Website found</span>
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
                      <span className="text-xs font-semibold text-warning">Website not found</span>
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    </div>
                  )}
                  {resume.portfolioUrl ? (
                    <Button variant="outline" size="sm" className="w-full rounded-full bg-secondary/60 font-medium" asChild>
                      <a href={resume.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View Website
                      </a>
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">No portfolio URL found in resume</p>
                  )}
                </div>
              </Spotlight>
            </div>

            {/* GitHub Repositories */}
            {github && github.repositories.length > 0 && (
              <div className="glass space-y-5 rounded-2xl p-6">
                <SectionHeading icon={Github}>Recent GitHub repositories</SectionHeading>
                <div className="grid gap-4 md:grid-cols-2">
                  {github.repositories.slice(0, 6).map((repo, index) => (
                    <Spotlight key={index} className="group rounded-xl border border-border bg-background/50 p-4 transition-transform duration-500 [transition-timing-function:var(--ease-out-quint)] hover:-translate-y-0.5">
                      <div className="relative mb-2 flex items-start justify-between gap-3">
                        <h4 className="truncate text-sm font-semibold transition-colors group-hover:text-primary-bright">{repo.name}</h4>
                        <div className="figure flex shrink-0 items-center text-xs text-muted-foreground">
                          <Star className="mr-1 h-3 w-3 fill-warning text-warning" />
                          {repo.stargazers_count}
                        </div>
                      </div>
                      <p className="relative mb-3 line-clamp-2 text-xs text-muted-foreground">{repo.description || "No description"}</p>
                      <div className="relative flex items-center justify-between">
                        <Badge variant="secondary" className="rounded-md font-mono text-[10px] font-medium">
                          {repo.language || "Unknown"}
                        </Badge>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-primary-bright hover:underline"
                        >
                          View →
                        </a>
                      </div>
                    </Spotlight>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Role Matching Tab */}
          <TabsContent value="matching" className="animate-fade-in-up mt-0 space-y-6">
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="mb-8">
                <SectionHeading icon={Target}>Role compatibility analysis</SectionHeading>
                <p className="mt-3 text-sm text-muted-foreground">AI-powered analysis of candidate fit for the specified role</p>
              </div>
              <div className="grid gap-10 md:grid-cols-2">
                <div>
                  <h4 className="eyebrow mb-5">Skill alignment</h4>
                  <div className="space-y-4">
                    {Object.entries(analysis.skillAlignment).map(([skill, score], i) => (
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
                <div>
                  <h4 className="eyebrow mb-5">Overall assessment</h4>
                  <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                    {[
                      { label: "Role Match Score", value: analysis.roleMatchScore },
                      { label: "Technical Skills", value: analysis.technicalSkillsScore },
                      { label: "Experience Level", value: analysis.experienceScore },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/40">
                        <dt className="text-sm">{row.label}</dt>
                        <dd><CountUp value={row.value} suffix="%" className="figure text-sm font-semibold" /></dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="glass-strong relative mt-8 overflow-hidden rounded-2xl p-6">
                <Aurora className="opacity-50" />
                <div className="relative">
                  <p className="eyebrow-accent mb-3">AI recommendation</p>
                  <p className="text-base leading-relaxed">{analysis.summary}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="animate-fade-in-up mt-0 space-y-6">
            <div className="glass space-y-10 rounded-2xl p-6 md:p-8">
              <div className="grid gap-10 md:grid-cols-2">
                <div className="space-y-5">
                  <SectionHeading icon={CheckCircle}>Key strengths</SectionHeading>
                  <ul className="space-y-2.5">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success))]" aria-hidden="true" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-5">
                  <SectionHeading icon={AlertTriangle}>Red flags</SectionHeading>
                  <ul className="space-y-2.5">
                    {analysis.redFlags.map((flag, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-danger shadow-[0_0_8px_hsl(var(--danger))]" aria-hidden="true" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-5">
                <SectionHeading icon={ListChecks}>Interview recommendations</SectionHeading>
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="p-4 transition-colors hover:bg-secondary/40">
                      <p className="text-sm leading-relaxed">{recommendation}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-5">
                <SectionHeading icon={MessageSquareText}>Suggested interview questions</SectionHeading>
                <ol className="space-y-3">
                  {analysis.interviewQuestions.map((question, index) => (
                    <li key={index} className="flex items-start gap-4 rounded-xl border border-border bg-background/50 p-4">
                      <span className="figure mt-0.5 text-xs text-primary-bright">Q{index + 1}</span>
                      <p className="text-sm font-medium leading-relaxed">{question}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-12 flex justify-center">
          <Button size="lg" className="btn-glow h-12 rounded-full px-8 text-base font-medium" onClick={handleDownloadReport}>
            <Download className="mr-1 h-4 w-4" />
            Download Full Report
          </Button>
        </div>
      </div>
    </div>
  )
}
