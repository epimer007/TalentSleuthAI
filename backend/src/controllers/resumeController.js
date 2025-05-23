const path = require("path");
const { extractText } = require("../utils/resumeParser");
const { parseResumeText } = require("../services/geminiService");
const { fetchGitHubProfile } = require("../services/githubService");
const { analyzeCandidateFit } = require("../services/geminiService"); // New function

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No file uploaded or invalid file type." });
    }

    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required." });
    }

    const filePath = path.resolve(req.file.path);
    const resumeText = await extractText(filePath);
    console.log("Extracted Resume Text Preview:\n", resumeText.slice(0, 500));

    const parsedData = await parseResumeText(resumeText);

    let githubData = null;
    if (parsedData.github) {
      const githubUsername = parsedData.github.split("/").pop();
      githubData = await fetchGitHubProfile(githubUsername);
    }

    // Perform analytics using Gemini
    const analytics = await analyzeCandidateFit(
      parsedData,
      githubData,
      jobDescription
    );

    res.status(200).json({
      message: "Resume uploaded and analyzed successfully",
      originalName: req.file.originalname,
      parsedData,
      githubData,
      analytics,
    });
  } catch (err) {
    console.error("Error processing resume:", err.message);
    res.status(500).json({ error: "Failed to process resume." });
  }
};
