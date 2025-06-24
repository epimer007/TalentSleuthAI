"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Brain, ArrowLeft, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { analyzeResumeAction } from "@/app/actions/analyze-resume"
import { useAuth } from "@/context/AuthContext"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user, signIn } = useAuth()

  useEffect(() => {
    if (user === null) {
      // Optionally, you can redirect or just show the sign-in UI below
      // router.push("/")
    }
  }, [user])

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
      setFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setProgress(0)
    setError("")

    try {
      const formData = new FormData()
      formData.append("resume", file)
      formData.append("jobDescription", jobDescription)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Call the server action
      const result = await analyzeResumeAction(formData)

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        if (!result.data) {
          setError("Analysis succeeded but no data was returned. Please try again.")
          setIsAnalyzing(false)
          setProgress(0)
          return
        }
        // Store the analysis data in sessionStorage for the results page
        sessionStorage.setItem("analysisData", JSON.stringify(result.data))
        // Navigate to results with the candidate ID
        router.push(`/analysis/${result.data.candidateId}`)
      } else {
        // Friendly error message for Gemini JSON parse error
        if (
          result.error &&
          (result.error.includes("Failed to parse Gemini analysis JSON") ||
            result.error.includes("SyntaxError"))
        ) {
          setError(
            "There was a problem analyzing the resume (invalid or corrupt data received from AI). Please reupload the resume and try again."
          )
        } else {
          setError(result.error || "Network error, reupload the resume.")
        }
        setIsAnalyzing(false)
        setProgress(0)
      }
    } catch (error: any) {
      setError("Network error, reupload the resume.")
      setIsAnalyzing(false)
      setProgress(0)
    }
  }

  // Show sign-in UI if not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400">
        <Card className="p-8 shadow-2xl bg-white/90 rounded-2xl border border-blue-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Sign in to continue</CardTitle>
            <CardDescription className="text-center">
              You must be signed in to upload and analyze resumes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={signIn} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-lg shadow">
              <Brain className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 animate-gradient-x">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-lg sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TalentSleuth AI</span>
          </Link>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-sm md:text-base shadow px-2 md:px-4 py-1 md:py-2">
            Upload & Analyze
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 drop-shadow">
            Upload <span className="text-blue-600">Candidate Resume</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Upload a resume and job description to start the <span className="font-semibold text-blue-700">AI-powered analysis</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 text-center">
            <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => {
                setError("")
                setFile(null)
                setJobDescription("")
              }}
            >
              Reupload Resume
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-10">
          {/* File Upload */}
          <Card className="border-0 shadow-2xl bg-white/90 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <FileText className="mr-2 h-5 w-5" />
                Resume Upload
              </CardTitle>
              <CardDescription>Upload resume in PDF, DOCX, or TXT format (max 10MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : file
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-blue-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto animate-bounce" />
                    <p className="font-medium text-green-700">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-blue-400 mx-auto animate-pulse" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">Drop your resume here</p>
                      <p className="text-gray-500">or click to browse</p>
                    </div>
                    <Button variant="outline" type="button" className="border-blue-400 text-blue-700">
                      Choose File
                    </Button>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="border-0 shadow-2xl bg-white/90 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Brain className="mr-2 h-5 w-5" />
                Job Description
              </CardTitle>
              <CardDescription>Paste the job description for role matching analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="min-h-[200px] resize-none bg-blue-50 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-medium">Quick Templates:</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-400 text-blue-700"
                    onClick={() =>
                      setJobDescription(
                        "Software Engineer - Full Stack Developer with 3+ years experience in React, Node.js, and cloud technologies. Strong problem-solving skills and experience with agile development."
                      )
                    }
                  >
                    Software Engineer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-400 text-blue-700"
                    onClick={() =>
                      setJobDescription(
                        "Product Manager - Experienced product manager with 5+ years in tech startups. Strong analytical skills, user research experience, and ability to work cross-functionally."
                      )
                    }
                  >
                    Product Manager
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Section */}
        {isAnalyzing ? (
          <Card className="mt-12 border-0 shadow-2xl bg-white/90 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Brain className="mr-2 h-5 w-5 animate-pulse" />
                Analyzing Candidate...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progress} className="w-full" />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg shadow">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Resume Parsing</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg shadow">
                    <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">AI Analysis</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg shadow">
                    <Upload className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Platform Search</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg shadow">
                    <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Report Generation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!file || !jobDescription.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-lg px-10 py-4 rounded-full shadow-xl transition"
            >
              <Brain className="mr-2 h-5 w-5" />
              Start AI Analysis
            </Button>
            {(!file || !jobDescription.trim()) && (
              <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {!file && "Please upload a resume to continue"}
                {!jobDescription.trim() && file && "Please enter a job description to continue"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}