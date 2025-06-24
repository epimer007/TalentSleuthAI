export interface ParsedResume {
  name?: string
  email?: string
  phone?: string
  location?: string
  summary?: string
  skills: string[]
  experience: WorkExperience[]
  education: Education[]
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  rawText: string
}

export interface WorkExperience {
  company: string
  position: string
  duration: string
  description?: string
}

export interface Education {
  institution: string
  degree: string
  field?: string
  year?: string
}

export async function parseResumeText(text: string): Promise<ParsedResume> {
  try {
    // Clean the text
    const cleanText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

    // Extract email
    const emailMatch = cleanText.match(/[\w.-]+@[\w.-]+\.\w+/g)
    const email = emailMatch ? emailMatch[0] : undefined

    // Extract phone
    const phoneMatch = cleanText.match(/(\+?\d{1,3}[-.\s]?)?[$$\d{3}$$]*[-.\s]?\d{3}[-.\s]?\d{4}/g)
    const phone = phoneMatch ? phoneMatch[0] : undefined

    // Extract GitHub URL
    const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-.]+/gi)
    const githubUrl = githubMatch ? githubMatch[0] : undefined

    // Extract LinkedIn URL
    const linkedinMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-.]+/gi)
    const linkedinUrl = linkedinMatch ? linkedinMatch[0] : undefined

    // Extract portfolio/website URL
    const portfolioMatch = cleanText.match(
      /(?:https?:\/\/)?(?:www\.)?[\w\-.]+\.(?:com|dev|io|net|org)(?:\/[\w\-.]*)?/gi,
    )
    const portfolioUrl = portfolioMatch
      ? portfolioMatch.find(
          (url) =>
            !url.includes("github.com") &&
            !url.includes("linkedin.com") &&
            !url.includes("email.com") &&
            !url.includes("gmail.com"),
        )
      : undefined

    // Extract name (usually first line or after "Name:")
    const nameMatch =
      cleanText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m) || cleanText.match(/Name:?\s*([A-Z][a-z]+ [A-Z][a-z]+)/i)
    const name = nameMatch ? nameMatch[1] : undefined

    // Extract skills (look for common skill section patterns)
    const skillsSection = cleanText.match(/(?:Skills?|Technologies?|Technical Skills?)[\s\S]*?(?=\n\n|\n[A-Z]|$)/i)
    let skills: string[] = []

    if (skillsSection) {
      const commonSkills = [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Python",
        "Java",
        "C++",
        "C#",
        "HTML",
        "CSS",
        "Angular",
        "Vue",
        "Express",
        "MongoDB",
        "PostgreSQL",
        "MySQL",
        "AWS",
        "Docker",
        "Kubernetes",
        "Git",
        "Linux",
        "REST",
        "GraphQL",
        "Redux",
        "Next.js",
        "Tailwind",
        "Bootstrap",
        "Firebase",
        "Redis",
        "Elasticsearch",
      ]

      skills = commonSkills.filter((skill) => cleanText.toLowerCase().includes(skill.toLowerCase()))
    }

    // Extract work experience (basic pattern matching)
    const experienceMatches = cleanText.match(
      /(?:Experience|Work History|Employment)[\s\S]*?(?=\n(?:Education|Skills|$))/i,
    )
    const experience: WorkExperience[] = []

    if (experienceMatches) {
      const expText = experienceMatches[0]
      const jobMatches = expText.match(
        /([A-Z][^,\n]*(?:Inc|Corp|LLC|Ltd|Company|Technologies|Systems)?)[,\s]*([A-Z][^,\n]*Engineer|Developer|Manager|Analyst|Specialist)[,\s]*(\d{4}[\s\-–to]*(?:\d{4}|Present|Current)?)/gi,
      )

      if (jobMatches) {
        jobMatches.forEach((match) => {
          const parts = match
            .split(/[,\n]/)
            .map((p) => p.trim())
            .filter((p) => p)
          if (parts.length >= 2) {
            experience.push({
              company: parts[0],
              position: parts[1],
              duration: parts[2] || "Unknown",
            })
          }
        })
      }
    }

    // Extract education
    const educationMatches = cleanText.match(/(?:Education|Academic Background|EDUCATION|Education & Training)[\s\S]*?(?=\n(?:Experience|Work History|Skills|$))/i)
    const education: Education[] = []

    if (educationMatches) {
      const eduText = educationMatches[0]
      // Try detailed match first
      let degreeMatches = eduText.match(
        /(Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|BA|BS|MA|MS)[^,\n]*[,\s]+([A-Za-z .&'-]+(?:University|College|Institute|School))[,\s]*(\d{4})?/gi,
      )
      // Fallback: match any line with University/College/Institute/School
      if (!degreeMatches) {
        degreeMatches = eduText.match(/.*(University|College|Institute|School).*/gi)
      }

      if (degreeMatches) {
        degreeMatches.forEach((match) => {
          const parts = match
            .split(/[,\n]/)
            .map((p) => p.trim())
            .filter((p) => p)
          if (parts.length >= 2) {
            education.push({
              degree: parts[0],
              institution: parts[1],
              year: parts[2],
            })
          } else if (parts.length === 1) {
            education.push({
              institution: parts[0],
              degree: "",
            })
          }
        })
      }
    }

    return {
      name,
      email,
      phone,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      skills,
      experience,
      education,
      rawText: cleanText,
    }
  } catch (error) {
    console.error("Error parsing resume text:", error)
    return {
      skills: [],
      experience: [],
      education: [],
      rawText: text,
    }
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  try {
    const fileType = file.type

    if (fileType === "text/plain") {
      return await file.text()
    }

    if (fileType === "application/pdf") {
      // For PDF parsing, use a library like pdf-parse in production
      const arrayBuffer = await file.arrayBuffer()
      const text = new TextDecoder().decode(arrayBuffer)
      return text
    }

    if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // For DOCX parsing, use a library like mammoth in production
      const arrayBuffer = await file.arrayBuffer()
      const text = new TextDecoder().decode(arrayBuffer)
      return text
    }

    // Fallback to treating as text
    return await file.text()
  } catch (error) {
    console.error("Error extracting text from file:", error)
    throw new Error("Failed to extract text from file. Please try a different file format.")
  }
}
