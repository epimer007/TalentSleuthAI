"use server"

import { extractTextFromFile} from "@/lib/resume-parser"
import { fetchGitHubProfile, extractGitHubInfoFromUrl, GitHubData } from "@/lib/github-api"
import { analyzeCandidate, parseResumeText } from "@/lib/gemini-ai"

export async function analyzeResumeAction(formData: FormData) {
  try {
    const file = formData.get("resume") as File
    const jobDescription = (formData.get("jobDescription") as string) || ""

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      }
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "File size too large. Please upload a file smaller than 10MB.",
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
        error: "Failed to extract text from file. Please try a different file.",
      }
    }

    if (!rawText || rawText.trim().length < 50) {
      return {
        success: false,
        error: "File appears to be empty or contains insufficient text. Please upload a valid resume.",
      }
    }

    // Step 2: Parse resume data
    console.log("Parsing resume data...")
    const resumeData = await parseResumeText(rawText)

    // Step 3: Fetch GitHub data if URL is present (with fallback)
    let githubData = null
    if (resumeData.githubUrl) {
      console.log("Attempting to fetch GitHub data...")
      try {
        // First try to fetch full GitHub data
        githubData = await fetchGitHubProfile(resumeData.githubUrl)

        if (!githubData) {
          // If API fails, extract basic info from URL
          console.log("GitHub API unavailable, extracting basic info from URL...")
          githubData = extractGitHubInfoFromUrl(resumeData.githubUrl)
        }
      } catch (error) {
        console.warn("GitHub data fetch failed, continuing without it:", error)
        // Try to extract basic info as fallback
        try {
          githubData = extractGitHubInfoFromUrl(resumeData.githubUrl)
        } catch (fallbackError) {
          console.warn("GitHub URL parsing also failed:", fallbackError)
        }
      }
    }

    // Step 4: Analyze with Gemini AI
    console.log("Analyzing with AI...")
    const analysis = await analyzeCandidate(resumeData, githubData as GitHubData | null, jobDescription)

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
    }
  }
}
