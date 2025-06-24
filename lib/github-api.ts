export interface GitHubProfile {
  login: string
  name: string | null
  bio: string | null
  company: string | null
  location: string | null
  email: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  avatar_url: string
  html_url: string
}

export interface GitHubRepo {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  html_url: string
  topics: string[]
}

export interface GitHubData {
  profile: GitHubProfile
  repositories: GitHubRepo[]
  languages: Record<string, number>
  totalCommits: number
  recentActivity: string
}

export async function fetchGitHubProfile(githubUrl: string): Promise<GitHubData | null> {
  try {
    // Extract username from GitHub URL
    const usernameMatch = githubUrl.match(/github\.com\/([^/?]+)/i)
    if (!usernameMatch) {
      console.warn("Invalid GitHub URL format:", githubUrl)
      return null
    }

    const username = usernameMatch[1]
    console.log(`Attempting to fetch GitHub data for user: ${username}`)

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Fetch profile data with better headers and error handling
    const profileResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "TalentSleuth-AI-1.0",
        // Add cache control to reduce API calls
        "Cache-Control": "max-age=300",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!profileResponse.ok) {
      if (profileResponse.status === 403) {
        console.warn("GitHub API rate limit exceeded or access forbidden")
        return null
      }
      if (profileResponse.status === 404) {
        console.warn(`GitHub user not found: ${username}`)
        return null
      }
      console.warn(`GitHub API error: ${profileResponse.status} ${profileResponse.statusText}`)
      return null
    }

    const profile: GitHubProfile = await profileResponse.json()
    console.log(`Successfully fetched profile for: ${profile.login}`)

    // Add delay before next request
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Fetch repositories with error handling
    let repositories: GitHubRepo[] = []
    try {
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "TalentSleuth-AI-1.0",
          "Cache-Control": "max-age=300",
        },
        signal: AbortSignal.timeout(10000),
      })

      if (reposResponse.ok) {
        repositories = await reposResponse.json()
        console.log(`Fetched ${repositories.length} repositories`)
      } else {
        console.warn(`Failed to fetch repositories: ${reposResponse.status}`)
        // Continue without repositories
      }
    } catch (repoError) {
      console.warn("Error fetching repositories:", repoError)
      // Continue without repositories
    }

    // Calculate language statistics
    const languages: Record<string, number> = {}
    repositories.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    })

    // Calculate recent activity
    const recentRepos = repositories.filter((repo) => {
      const updatedDate = new Date(repo.updated_at)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return updatedDate > sixMonthsAgo
    })

    const recentActivity = `${recentRepos.length} repositories updated in the last 6 months`

    return {
      profile,
      repositories: repositories.slice(0, 10), // Top 10 most recent repos
      languages,
      totalCommits: repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0), // Using stars as proxy
      recentActivity,
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        console.warn("GitHub API request timed out")
      } else if (error.name === "AbortError") {
        console.warn("GitHub API request was aborted")
      } else {
        console.warn("Error fetching GitHub data:", error.message)
      }
    } else {
      console.warn("Unknown error fetching GitHub data:", error)
    }
    return null
  }
}

// Alternative function to extract GitHub info without API calls
export function extractGitHubInfoFromUrl(githubUrl: string): Partial<GitHubData> | null {
  try {
    const usernameMatch = githubUrl.match(/github\.com\/([^/?]+)/i)
    if (!usernameMatch) {
      return null
    }

    const username = usernameMatch[1]

    // Return basic info that can be inferred from the URL
    return {
      profile: {
        login: username,
        name: null,
        bio: null,
        company: null,
        location: null,
        email: null,
        public_repos: 0,
        followers: 0,
        following: 0,
        created_at: "",
        updated_at: "",
        avatar_url: `https://github.com/${username}.png`,
        html_url: githubUrl,
      } as GitHubProfile,
      repositories: [],
      languages: {},
      totalCommits: 0,
      recentActivity: "GitHub profile found (detailed analysis unavailable)",
    }
  } catch (error) {
    console.warn("Error extracting GitHub info from URL:", error)
    return null
  }
}
