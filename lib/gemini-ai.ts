import { GoogleGenerativeAI } from "@google/generative-ai"
import { jsonrepair } from "jsonrepair"
import { ParsedResume } from "./resume-parser"

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
 * Helper to call Gemini with retries and model fallback.
 */
async function generateContentWithRetry(modelName: string, prompt: string, attempt = 1): Promise<string> {
  if (!genAI) throw new Error("Gemini AI not available")
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    if (!text) {
      throw new Error("Empty response from Gemini")
    }
    
    return text
  } catch (error: any) {
    const errorMessage = error?.message || ""
    const isQuota = error?.status === 429 || errorMessage.includes("429") || errorMessage.includes("quota")
    const isModelError = errorMessage.includes("model not found") || errorMessage.includes("not found") || errorMessage.includes("404")
    
    // Fallback logic
    if (isModelError || isQuota) {
      // If we were trying a 2.0 model or the non-existent 2.5, fallback to 1.5-flash
      if (modelName.includes("2.0") || modelName.includes("2.5")) {
        console.warn(`Gemini ${modelName} failed (${isQuota ? "quota" : "not found"}), falling back to 1.5-flash`)
        return generateContentWithRetry("gemini-1.5-flash", prompt)
      }
       
      // If we already tried 1.5-flash and failed due to quota, try a few retries with backoff
      if (isQuota && attempt < 3) {
        const delay = attempt * 2000 // 2s, 4s
        console.warn(`Gemini quota hit, retrying in ${delay}ms (attempt ${attempt})...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return generateContentWithRetry(modelName, prompt, attempt + 1)
      }
    }
    
    console.error(`Gemini API error (${modelName}):`, error)
    throw error
  }
}

/**
 * Calls Gemini to parse the raw resume text into structured data.
 */
export async function parseResumeText(rawText: string): Promise<ParsedResume> {
  if (!genAI) {
    throw new Error("Gemini AI not available")
  }

  // Prompt Gemini to extract structured data from the resume text
  const prompt = `
You are an expert resume parser. Extract the following fields from the provided resume text and return ONLY a valid JSON object.
Do not include any markdown formatting like \`\`\`json or explanatory text.

{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "location": "City, Country",
  "summary": "Professional summary",
  "skills": ["Skill 1", "Skill 2"],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "duration": "Start - End",
      "description": "Job description"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree",
      "field": "Field of Study",
      "year": "Year"
    }
  ],
  "githubUrl": "https://github.com/username",
  "linkedinUrl": "https://linkedin.com/in/username",
  "portfolioUrl": "https://example.com"
}

Resume Text:
${rawText}
`
  
  try {
    const text = await generateContentWithRetry("gemini-1.5-flash", prompt)

    // Try to parse JSON from the response
    // Look for the first '{' and last '}' to extract the JSON object
    const startIdx = text.indexOf('{')
    const endIdx = text.lastIndexOf('}')
    
    if (startIdx === -1 || endIdx === -1) {
      throw new Error("No JSON object found in Gemini response")
    }
    
    const jsonStr = text.substring(startIdx, endIdx + 1)

    let parsed: ParsedResume
    try {
      const data = JSON.parse(jsonrepair(jsonStr))
      parsed = {
        ...data,
        skills: Array.isArray(data.skills) ? data.skills : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        education: Array.isArray(data.education) ? data.education : [],
        rawText: rawText
      }
    } catch (parseError) {
      console.error("JSON parse error after repair:", parseError, "Original text:", text)
      throw new Error("Failed to parse resume structure. The document format might be too complex.")
    }

    return parsed
  } catch (error) {
    console.error("Error in parseResumeText:", error)
    throw error
  }
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
Return ONLY a valid JSON object. Do not include markdown formatting.

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
`

  const text = await generateContentWithRetry("gemini-2.0-flash", prompt)

  // Try to parse JSON from the response
  const startIdx = text.indexOf('{')
  const endIdx = text.lastIndexOf('}')
  
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("No valid JSON found in Gemini analysis response")
  }
  
  const jsonStr = text.substring(startIdx, endIdx + 1)

  let analysis: AIAnalysis
  try {
    analysis = JSON.parse(jsonrepair(jsonStr))
  } catch (parseError) {
    console.error("Analysis JSON parse error:", parseError, "Original text:", text)
    throw new Error("Failed to parse Gemini analysis JSON")
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
