"use server"

import { extractTextFromFile, parseResumeTextRegex } from "@/lib/resume-parser"
import { fetchGitHubProfile, extractGitHubInfoFromUrl, GitHubData } from "@/lib/github-api"
import { analyzeCandidate, parseResumeText } from "@/lib/gemini-ai"

export type ErrorCode = 
  | "NO_FILE"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "PARSE_ERROR"
  | "QUOTA_EXCEEDED"
  | "UNEXPECTED_ERROR"

export async function analyzeResumeAction(formData: FormData) {
  try {
    const file = formData.get("resume") as File
    const jobDescription = (formData.get("jobDescription") as string) || ""

    if (!file) {
      return {
        success: false,
        error: "No file provided",
        code: "NO_FILE" as ErrorCode
      }
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "File size too large. Please upload a file smaller than 10MB.",
        code: "FILE_TOO_LARGE" as ErrorCode
      }
    }

    // Validate file type
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a PDF, DOCX, or TXT file.",
        code: "INVALID_FILE_TYPE" as ErrorCode
      }
    }

    // Step 1: Extract text from file
    console.log("Extracting text from file...")
    let rawText: string
    try {
      rawText = await extractTextFromFile(file)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to extract text from file.",
        code: "PARSE_ERROR" as ErrorCode
      }
    }

    if (!rawText || rawText.trim().length < 50) {
      return {
        success: false,
        error: "File appears to be empty or contains insufficient text. Please upload a valid resume.",
        code: "PARSE_ERROR" as ErrorCode
      }
    }

    // Step 2: Parse resume data
    console.log("Parsing resume data...")
    let resumeData;
    try {
      resumeData = await parseResumeText(rawText)
    } catch (error: any) {
      console.warn("AI parsing failed, falling back to regex parsing:", error)
      const isQuota = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota")
      
      try {
        // Fallback to regex-based parsing
        resumeData = await parseResumeTextRegex(rawText)
      } catch (fallbackError) {
        return {
          success: false,
          error: isQuota ? "AI rate limit reached. Please try again in a few minutes." : "Failed to parse resume data.",
          code: (isQuota ? "QUOTA_EXCEEDED" : "PARSE_ERROR") as ErrorCode
        }
      }
    }


    // Step 3: Fetch GitHub data if URL is present (with fallback)
    let githubData = null
    if (resumeData.githubUrl) {
      console.log("Attempting to fetch GitHub data...")
      try {
        githubData = await fetchGitHubProfile(resumeData.githubUrl)
        if (!githubData) {
          githubData = extractGitHubInfoFromUrl(resumeData.githubUrl)
        }
      } catch (error) {
        console.warn("GitHub data fetch failed, continuing with basic URL info:", error)
        githubData = extractGitHubInfoFromUrl(resumeData.githubUrl)
      }
    }

    // Step 4: Analyze with Gemini AI
    console.log("Analyzing with AI...")
    let analysis;
    try {
      analysis = await analyzeCandidate(resumeData, githubData as GitHubData | null, jobDescription)
    } catch (error: any) {
      const isQuota = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota")
      return {
        success: false,
        error: isQuota ? "AI rate limit reached. Please try again in a few minutes." : "AI analysis failed.",
        code: (isQuota ? "QUOTA_EXCEEDED" : "PARSE_ERROR") as ErrorCode
      }
    }

    // Step 5: Return combined data
    return {
      success: true,
      data: {
        resume: resumeData,
        github: githubData,
        analysis,
        candidateId: `candidate-${Date.now()}`,
      },
    }
  } catch (error) {
    console.error("Error analyzing resume:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      code: "UNEXPECTED_ERROR" as ErrorCode
    }
  }
}
