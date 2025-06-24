"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Brain,
  ArrowLeft,
  User,
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Link href="/upload">
            <Button>Reupload Resume</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-4">No analysis data found</p>
          <Link href="/upload">
            <Button>Upload New Resume</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { resume, github, analysis } = analysisData

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-lg sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/upload" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TalentSleuth AI</span>
          </Link>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 text-sm md:text-base shadow px-2 md:px-4 py-1 md:py-2"
          >
            Candidate Analysis
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Candidate Header */}
        <Card className="mb-10 border-0 shadow-2xl bg-white/90 rounded-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24 shadow-lg ring-4 ring-blue-200">
                <AvatarImage src={github?.profile.avatar_url || "/placeholder.svg"} alt={resume.name || "Candidate"} />
                <AvatarFallback className="text-2xl">
                  {resume.name
                    ? resume.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "??"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{resume.name || "Candidate Name"}</h1>
                    <p className="text-xl text-gray-600 mb-2">{resume.experience[0]?.position || "Professional"}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{analysis.overallScore}</div>
                      <div className="text-sm text-gray-500">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{analysis.roleMatchScore}%</div>
                      <div className="text-sm text-gray-500">Role Match</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                  {resume.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {resume.email}
                    </div>
                  )}
                  {(resume.location || github?.profile.location) && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {resume.location || github?.profile.location}
                    </div>
                  )}
                  {resume.experience.length > 0 && (
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {resume.experience.length} positions
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white border shadow-sm rounded-xl mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="matching">Role Matching</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Score Breakdown */}
              <Card className="border-0 shadow-lg bg-white/90 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Technical Skills</span>
                      <span className="text-sm text-gray-600">{analysis.technicalSkillsScore}%</span>
                    </div>
                    <Progress value={analysis.technicalSkillsScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Experience Level</span>
                      <span className="text-sm text-gray-600">{analysis.experienceScore}%</span>
                    </div>
                    <Progress value={analysis.experienceScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Profile Completeness</span>
                      <span className="text-sm text-gray-600">{analysis.profileCompletenessScore}%</span>
                    </div>
                    <Progress value={analysis.profileCompletenessScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Data Consistency</span>
                      <span className="text-sm text-gray-600">{analysis.dataConsistencyScore}%</span>
                    </div>
                    <Progress value={analysis.dataConsistencyScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border-0 shadow-lg bg-white/90 rounded-xl">
                <CardHeader>
                  <CardTitle>Key Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                        {skill}
                      </Badge>
                    ))}
                    {github &&
                      Object.keys(github.languages).map((language, index) => (
                        <Badge key={`github-${index}`} variant="secondary" className="bg-green-100 text-green-700">
                          {language}
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Summary */}
              <Card className="border-0 shadow-lg bg-white/90 rounded-xl">
                <CardHeader>
                  <CardTitle>AI Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">{analysis.summary}</p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-700 text-sm flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Top Strengths
                    </h4>
                    <ul className="text-xs space-y-1">
                      {analysis.strengths.slice(0, 3).map((strength, index) => (
                        <li key={index} className="text-gray-600">
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Work History */}
            <Card className="border-0 shadow-lg bg-white/90 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Work History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resume.experience.map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{job.position}</h4>
                        <p className="text-gray-600">
                          {job.company} • {job.duration}
                        </p>
                        {job.description && <p className="text-sm text-gray-500 mt-1">{job.description}</p>}
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  ))}
                  {resume.experience.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No work experience found in resume</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* GitHub */}
              <Card className="border-0 shadow-lg bg-white/90 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Github className="mr-2 h-5 w-5" />
                    GitHub Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {github ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Profile Found</span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Repositories:</strong> {github.profile.public_repos}
                        </p>
                        <p>
                          <strong>Followers:</strong> {github.profile.followers}
                        </p>
                        <p>
                          <strong>Top Languages:</strong> {Object.keys(github.languages).slice(0, 3).join(", ")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={github.profile.html_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Profile
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Profile Found</span>
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {resume.githubUrl ? "Unable to fetch GitHub data" : "No GitHub URL found in resume"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* LinkedIn */}
              <Card className="border-0 shadow-lg bg-white/90 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Linkedin className="mr-2 h-5 w-5" />
                    LinkedIn Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Profile Found</span>
                      {resume.linkedinUrl ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    {resume.linkedinUrl ? (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={resume.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Profile
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-600">No LinkedIn URL found in resume</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio */}
              <Card className="border-0 shadow-lg bg-white/90 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Portfolio Website
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Website Found</span>
                      {resume.portfolioUrl ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    {resume.portfolioUrl ? (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={resume.portfolioUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Website
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-600">No portfolio URL found in resume</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* GitHub Repositories */}
            {github && github.repositories.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/90 rounded-xl">
                <CardHeader>
                  <CardTitle>Recent GitHub Repositories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {github.repositories.slice(0, 6).map((repo, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{repo.name}</h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="h-3 w-3 mr-1" />
                            {repo.stargazers_count}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{repo.description || "No description"}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {repo.language || "Unknown"}
                          </Badge>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Role Matching Tab */}
          <TabsContent value="matching" className="space-y-8">
            <Card className="border-0 shadow-lg bg-white/90 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Role Compatibility Analysis
                </CardTitle>
                <CardDescription>AI-powered analysis of candidate fit for the specified role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium mb-4">Skill Alignment</h4>
                    <div className="space-y-3">
                      {Object.entries(analysis.skillAlignment).map(([skill, score]) => (
                        <div key={skill}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">{skill}</span>
                            <span className="text-sm font-medium">{score}%</span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Overall Assessment</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm">Role Match Score</span>
                        <Badge className="bg-blue-100 text-blue-700">{analysis.roleMatchScore}%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm">Technical Skills</span>
                        <Badge className="bg-green-100 text-green-700">{analysis.technicalSkillsScore}%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm">Experience Level</span>
                        <Badge className="bg-purple-100 text-purple-700">{analysis.experienceScore}%</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">AI Recommendation</h4>
                  <p className="text-blue-800">{analysis.summary}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-8">
            <Card className="border-0 shadow-lg bg-white/90 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-green-700 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Red Flags
                    </h4>
                    <ul className="space-y-2">
                      {analysis.redFlags.map((flag, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-3">Interview Recommendations</h4>
                  <div className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-3">Suggested Interview Questions</h4>
                  <div className="space-y-2">
                    {analysis.interviewQuestions.map((question, index) => (
                      <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50">
                        <p className="text-sm text-blue-800">{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center mt-12">
          <Button size="lg" variant="outline" className="bg-white/90 shadow-lg hover:bg-blue-100 text-blue-700 text-lg px-8 py-4 rounded-xl transition" onClick={handleDownloadReport}>
            <Download className="mr-2 h-5 w-5" />
            Download Full Report
          </Button>
        </div>
      </div>
    </div>
  )
}
