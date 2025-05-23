const axios = require("axios");

async function fetchGitHubProfile(username) {
  if (!username) return null;

  const userUrl = `https://api.github.com/users/${username}`;
  const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100`;

  try {
    const [userRes, reposRes] = await Promise.all([
      axios.get(userUrl),
      axios.get(reposUrl),
    ]);

    const userData = userRes.data;
    const repos = reposRes.data;

    const repoSummaries = repos.map((repo) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      url: repo.html_url,
    }));

    return {
      username: userData.login,
      name: userData.name,
      bio: userData.bio,
      avatar: userData.avatar_url,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      profileUrl: userData.html_url,
      repos: repoSummaries,
    };
  } catch (err) {
    console.error("GitHub API error:", err.message);
    return null;
  }
}

module.exports = { fetchGitHubProfile };
