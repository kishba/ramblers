interface ArticleData {
  team: string;
  headline: string;
  lastUpdated: string;
  urlPath: string;
  containsRecap: boolean;
}

export async function scrapeHeadlines(baseUrl: string): Promise<ArticleData[]> {
  // Fetch HTML from URL
  const response = await fetch(baseUrl);
  const html = await response.text();

  // Create DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Get all articles
  const articles = doc.querySelectorAll("article[data-vnn-news-feed-item]");

  const extractedData = Array.from(articles).map((article) => {
    // Get headline
    const headlineElement = article.querySelector(".article-title");
    const headline = headlineElement?.textContent?.trim() || "N/A";

    // Get team
    const teamElement = article.querySelector(".article-meta span:first-child");
    const team = teamElement?.textContent?.trim() || "N/A";

    // Get last updated time
    const timeElement = article.querySelector("time.updated");
    const lastUpdated = timeElement?.getAttribute("datetime") || "N/A";

    // Get URL and check for recap
    const linkElement = article.querySelector(
      ".article-title"
    ) as HTMLAnchorElement;
    const fullUrl = linkElement?.href || "N/A";
    const urlPath = fullUrl !== "N/A" ? new URL(fullUrl).pathname : "N/A";
    const containsRecap = urlPath.toLowerCase().includes("recap");

    return {
      team,
      headline,
      lastUpdated,
      urlPath,
      containsRecap,
    };
  });

  return extractedData;
}
