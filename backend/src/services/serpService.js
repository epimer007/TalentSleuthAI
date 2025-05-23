const axios = require('axios');

const SERP_API_KEY ="";

async function searchLinkedInProfile(fullName, email = '') {
  const query = `site:linkedin.com/in "${fullName}" ${email}`.trim();
  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&engine=google&api_key=${SERP_API_KEY}`;

  try {
    const response = await axios.get(url);
    const results = response.data.organic_results;

    if (results && results.length > 0) {
      // Find the first LinkedIn profile link in results
      const linkedIn = results.find(r => r.link && r.link.includes('linkedin.com/in'));
      if (linkedIn) {
        return {
          name: linkedIn.title,
          snippet: linkedIn.snippet,
          link: linkedIn.link,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('SerpAPI LinkedIn search error:', error.message);
    return null;
  }
}

module.exports = { searchLinkedInProfile };
