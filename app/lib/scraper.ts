// app/server/scraper.ts
interface Article {
  team: string;
  headline: string;
  lastUpdated: string;
  urlPath: string;
  containsRecap: boolean;
}

class ArticleParser {
  articles: Article[] = [];
  currentArticle: Partial<Article> = {};

  element(element: Element) {
    if (element.tagName === "article") {
      // Start new article
      this.currentArticle = {};
    }

    if (element.tagName === "a" && element.hasAttribute("href")) {
      const href = element.getAttribute("href") || "";
      this.currentArticle.urlPath = new URL(href).pathname;
      this.currentArticle.containsRecap = href.toLowerCase().includes("recap");
      this.currentArticle.headline = element.textContent;
    }

    if (element.tagName === "time") {
      this.currentArticle.lastUpdated = element.getAttribute("datetime") || "";
    }

    if (element.tagName === "span" && element.hasAttribute("class")) {
      this.currentArticle.team = element.textContent;
    }
  }

  text(text: Text) {
    // Handle text nodes if needed
  }

  endTag(tag: string) {
    if (tag === "article" && this.isValidArticle(this.currentArticle)) {
      this.articles.push(this.currentArticle as Article);
    }
  }

  private isValidArticle(article: Partial<Article>): boolean {
    return !!(
      article.team &&
      article.headline &&
      article.lastUpdated &&
      article.urlPath
    );
  }
}

export async function scrapeArticles() {
  const response = await fetch("https://boyneramblers.com");
  const html = await response.text();
  console.log(html);

  const parser = new ArticleParser();
  const rewriter = new HTMLRewriter()
    .on("article[data-vnn-news-feed-item]", parser)
    .on(".article-title", parser)
    .on("time.updated", parser)
    .on(".article-meta span:first-child", parser);

  await rewriter.transform(new Response(html)).text();

  return parser.articles;
}
