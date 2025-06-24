import { GoogleGenerativeAI } from "@google/generative-ai"

// Define the structure for the parsed resume (from Gemini)
export interface ParsedResume {
  name?: string
  email?: string
  phone?: string
  location?: string
  summary?: string
  skills?: string[]
  experience?: any[]
  education?: any[]
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  rawText: string
}

// Analysis result structure
export interface AIAnalysis {
  overallScore: number
  roleMatchScore: number
  technicalSkillsScore: number
  experienceScore: number
  profileCompletenessScore: number
  dataConsistencyScore: number
  strengths: string[]
  redFlags: string[]
  recommendations: string[]
  interviewQuestions: string[]
  summary: string
  skillAlignment: Record<string, number>
}

// --- Gemini API Setup ---
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.warn("GEMINI_API_KEY not found in environment variables")
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

/**
 * Calls Gemini to parse the raw resume text into structured data.
 */
export async function parseResumeText(rawText: string): Promise<ParsedResume> {
  if (!genAI) {
    throw new Error("Gemini AI not available")
  }

  // Prompt Gemini to extract structured data from the resume text
  const prompt = `
You are an expert resume parser. Extract the following fields from the provided resume text and return a JSON object:
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "summary": string,
  "skills": string[],
  "experience": [
    {
      "company": string,
      "position": string,
      "duration": string,
      "description": string
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "field": string,
      "year": string
    }
  ],
  "githubUrl": string,
  "linkedinUrl": string,
  "portfolioUrl": string
}

Resume Text:
${rawText}
`
  // Use only gemini-1.5-flash model
  let model = null
  try {
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
  } catch (error) {
    throw new Error("Gemini 2.0 Flash model not available: " + error)
  }

  if (!model) {
    throw new Error("Gemini 2.0 Flash model could not be initialized")
  }

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  // Try to parse JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("No valid JSON found in Gemini response")
  }

  let parsed: ParsedResume
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch (parseError) {
    throw new Error("Failed to parse Gemini response JSON: " + parseError)
  }

  // Always include the raw text
  parsed.rawText = rawText

  return parsed
}

/**
 * Performs analysis on the parsed resume (e.g., scoring, recommendations).
 */
export async function analyzeCandidate(
  resume: ParsedResume,
  githubData: any | null,
  jobDescription: string,
): Promise<AIAnalysis> {
  if (!genAI) {
    throw new Error("Gemini AI not available")
  }

  const githubInfo = githubData
    ? `
GITHUB DATA:
Profile: ${githubData.profile?.name || githubData.profile?.login || "Unknown"}
Bio: ${githubData.profile?.bio || "No bio"}
Company: ${githubData.profile?.company || "Not specified"}
Location: ${githubData.profile?.location || "Not specified"}
Public Repos: ${githubData.profile?.public_repos || 0}
Followers: ${githubData.profile?.followers || 0}
Programming Languages: ${
        Object.entries(githubData.languages || {})
          .map(([lang, count]) => `${lang} (${count} repos)`)
          .join(", ") || "None detected"
      }
Recent Activity: ${githubData.recentActivity || "No recent activity data"}
Top Repositories: ${
        (githubData.repositories || [])
          .slice(0, 5)
          .map((repo: any) => `${repo.name} (${repo.language || "Unknown"}, ${repo.stargazers_count || 0} stars)`)
          .join("; ") || "No repositories found"
      }
`
    : "GITHUB DATA: Not available"

  const prompt = `
You are an expert AI talent analyst. Analyze the following candidate data and provide a comprehensive assessment.

RESUME DATA:
Name: ${resume.name || "Not provided"}
Email: ${resume.email || "Not provided"}
Skills: ${resume.skills?.join(", ") || "None listed"}
Experience: ${resume.experience?.map((exp: any) => `${exp.position} at ${exp.company} (${exp.duration})`).join("; ") || "None listed"}
GitHub URL: ${resume.githubUrl || "Not provided"}
LinkedIn URL: ${resume.linkedinUrl || "Not provided"}

${githubInfo}

JOB DESCRIPTION:
${jobDescription || "No job description provided"}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallScore": number (0-100),
  "roleMatchScore": number (0-100),
  "technicalSkillsScore": number (0-100),
  "experienceScore": number (0-100),
  "profileCompletenessScore": number (0-100),
  "dataConsistencyScore": number (0-100),
  "strengths": ["strength1", "strength2", "strength3"],
  "redFlags": ["flag1", "flag2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "interviewQuestions": ["question1", "question2", "question3"],
  "summary": "A comprehensive 2-3 sentence summary of the candidate",
  "skillAlignment": {
    "skill1": score (0-100),
    "skill2": score (0-100)
  }
}

Focus on:
1. Technical skill alignment with job requirements
2. Experience relevance and progression
3. GitHub activity and code quality indicators (if available)
4. Red flags like employment gaps, skill mismatches, no relevant projects on github.
5. Specific recommendations for hiring decision
6. Tailored interview questions based on the analysis
7. roleMatchScore based on how well the candidate fits the job description and overallScore.

Provide specific, actionable insights based on the data provided.
`

  // Use only gemini-1.5-flash model
  let model = null
  try {
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  } catch (error) {
    throw new Error("Gemini 1.5 Flash model not available: " + error)
  }

  if (!model) {
    throw new Error("Gemini 1.5 Flash model could not be initialized")
  }

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  // Try to parse JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("No valid JSON found in Gemini analysis response")
  }

  let analysis: AIAnalysis
  try {
    analysis = JSON.parse(jsonMatch[0])
  } catch (parseError) {
    throw new Error("Failed to parse Gemini analysis JSON: " + parseError)
  }

  // Validate and provide defaults
  return {
    overallScore: Math.min(100, Math.max(0, analysis.overallScore || 75)),
    roleMatchScore: Math.min(100, Math.max(0, analysis.roleMatchScore || 80)),
    technicalSkillsScore: Math.min(100, Math.max(0, analysis.technicalSkillsScore || 85)),
    experienceScore: Math.min(100, Math.max(0, analysis.experienceScore || 70)),
    profileCompletenessScore: Math.min(100, Math.max(0, analysis.profileCompletenessScore || 90)),
    dataConsistencyScore: Math.min(100, Math.max(0, analysis.dataConsistencyScore || 95)),
    strengths: Array.isArray(analysis.strengths)
      ? analysis.strengths
      : ["Strong technical background", "Good experience progression"],
    redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
    recommendations: Array.isArray(analysis.recommendations)
      ? analysis.recommendations
      : ["Consider for technical interview", "Assess cultural fit"],
    interviewQuestions: Array.isArray(analysis.interviewQuestions)
      ? analysis.interviewQuestions
      : ["Tell me about your recent projects", "How do you approach problem-solving?"],
    summary:
      typeof analysis.summary === "string"
        ? analysis.summary
        : "Candidate shows promise with relevant technical skills and experience.",
    skillAlignment: typeof analysis.skillAlignment === "object" ? analysis.skillAlignment : {},
  }
}
