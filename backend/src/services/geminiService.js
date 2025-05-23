const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI("AIzaSyDWSMCFJQvHV-mZhz_z9plMPWjFzvl5FpA"); // Use your actual key securely

function sanitizeText(text) {
  return text
    .replace(/\n{2,}/g, "\n")
    .replace(/[^\x20-\x7E\n]/g, "") // Remove non-printable ASCII
    .trim()
    .slice(0, 7000); // Limit to avoid token overload
}

async function parseResumeText(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an intelligent resume parser. Extract structured data from the following resume text.

IMPORTANT: Reply with ONLY valid JSON. No extra explanation or Markdown.

Format:
{
  "fullName": string,
  "email": string,
  "phone": string,
  "education": [string],
  "experience": [string],
  "skills": [string],
  "certifications": [string],
  "linkedIn": string (optional),
  "github": string (optional)
}

Resume Text:
"""${sanitizeText(text)}"""
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = await response.text();

    console.log("Gemini raw response:\n", textResponse);

    const jsonStart = textResponse.indexOf("{");
    const jsonEnd = textResponse.lastIndexOf("}");
    const jsonString = textResponse.substring(jsonStart, jsonEnd + 1);

    const json = JSON.parse(jsonString);
    return json;
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("Gemini API did not return valid JSON");
  }
}

async function analyzeCandidateFit(resumeData, githubData, jobDescription) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an AI Talent Analyst.

Given the candidate's resume data and GitHub information, evaluate their fitness for the following job description.

Reply in structured JSON:
{
  "fitScore": number (0-100),
  "strengths": [string],
  "weaknesses": [string],
  "relevantProjects": [string],
  "redFlags": [string]
}

Candidate Resume:
${JSON.stringify(resumeData, null, 2)}

GitHub Data:
${JSON.stringify(githubData || {}, null, 2)}

Job Description:
"""${jobDescription}"""
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = await response.text();

    const jsonStart = textResponse.indexOf("{");
    const jsonEnd = textResponse.lastIndexOf("}");
    const jsonString = textResponse.substring(jsonStart, jsonEnd + 1);

    const json = JSON.parse(jsonString);
    return json;
  } catch (e) {
    console.error("Failed to parse Gemini analytics response:", e.message);
    return { summary: "Analysis could not be parsed.", raw: e.message };
  }
}

module.exports = {
  parseResumeText,
  analyzeCandidateFit,
};
