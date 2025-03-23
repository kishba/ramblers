import { Form, redirect, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { requireUser, setUserId } from "~/lib/session";
import { scrapeArticles } from "~/lib/scraper";

interface Headline {
  title: string;
  url: string;
  modifiedGmt: string;
}

interface PageLink {
  url: string;
  text: string;
}

// Simple handler that just extracts article headlines
class HeadlineHandler {
  headlines: Headline[] = [];
  currentTitle: string = "";
  currentUrl: string = "";
  currentModifiedGmt: string = "";

  element(element: Element) {
    // console.log("element", element.tagName);

    // We're only interested in the headline links
    if (
      element.tagName === "a" &&
      element.hasAttribute("class") &&
      element.getAttribute("class")?.includes("article-title")
    ) {
      // Store the URL when we find the link
      this.currentUrl = element.getAttribute("href") || "";
    }
    if (element.tagName === "time") {
      this.currentModifiedGmt = element.getAttribute("datetime") || "";
    }
  }

  text(text: Text) {
    // If we have a URL set, this text is likely the title
    if (this.currentUrl) {
      this.currentTitle = text.text.trim();

      // If we have both title and URL, add to our headlines array
      if (this.currentTitle && this.currentUrl) {
        this.headlines.push({
          title: this.currentTitle,
          url: this.currentUrl,
          modifiedGmt: this.currentModifiedGmt,
        });

        // Reset for the next headline
        this.currentTitle = "";
        this.currentUrl = "";
        this.currentModifiedGmt = "";
      }
    }
  }

  getRecapHeadlines(): Headline[] {
    return this.headlines.filter((headline) =>
      headline.url.includes("/recap/")
    );
  }
}

// Simple handler that just extracts article headlines
class PageLinkHandler {
  pageLinks: PageLink[] = [];
  currentUrl: string = "";
  currentText: string = "";

  element(element: Element) {
    // We're only interested in the headline links
    if (
      element.tagName === "a" &&
      element.hasAttribute("class") &&
      element.getAttribute("class")?.includes("page-link")
    ) {
      // Store the URL when we find the link
      this.currentUrl = element.getAttribute("href") || "";
      this.currentText = element.textContent?.trim() || "";
    }
  }

  text(text: Text) {
    // If we have a URL set, this text is likely the title
    if (this.currentUrl) {
      this.currentText = text.text.trim();

      // If we have both title and URL, add to our headlines array
      if (this.currentText && this.currentUrl) {
        this.pageLinks.push({
          text: this.currentText,
          url: this.currentUrl,
        });

        // Reset for the next link
        this.currentText = "";
        this.currentUrl = "";
      }
    }
  }
}

export function meta() {
  return [
    { title: "Boyner Ramblers Headlines" },
    { name: "description", content: "Latest headlines from Boyner Ramblers" },
  ];
}

export function action() {
  setUserId(undefined);
  throw redirect("/");
}

export async function loader() {
  requireUser();

  try {
    // Fetch the target website
    console.log("Fetching from boyneramblers.com");
    const response = await fetch("https://boyneramblers.com/");

    // Check if the fetch was successful
    if (!response.ok) {
      console.error("Failed to fetch with status:", response.status);
      throw new Response("Failed to fetch content", {
        status: response.status,
      });
    }

    // Create our simplified handler
    const handler = new HeadlineHandler();
    const pageLinkHandler = new PageLinkHandler();

    // Apply the HTML rewriter focused only on headline links
    const transformed = new HTMLRewriter()
      .on("time.updated", handler)
      .on("a.article-title", handler)
      .on("a.page-link", pageLinkHandler)
      .transform(response);

    // Process the entire response
    await transformed.text();

    console.log(`Found ${handler.headlines.length} headlines`);
    console.log(`Found ${handler.getRecapHeadlines().length} recap headlines`);
    console.log(`Found ${pageLinkHandler.pageLinks.length} page links`);

    let maxPage = -Infinity;
    let maxIndex = -1;

    pageLinkHandler.pageLinks.forEach((item: PageLink, index: number) => {
      const num = Number(item.text);
      if (!isNaN(num) && num > maxPage) {
        maxPage = num;
        maxIndex = index;
      }
    });
    const numberOfPages = maxPage;
    console.log(`Found ${numberOfPages} pages`);

    // Return just the headlines
    return {
      headlines: handler.headlines,
      recapHeadlines: handler.getRecapHeadlines(),
      pageLinks: pageLinkHandler.pageLinks,
      numberOfPages,
      source: "boyneramblers.com",
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching headlines:", error);
    throw new Response(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      {
        status: 500,
      }
    );
  }
}

export default function Dashboard() {
  const { headlines, pageLinks, numberOfPages, recapHeadlines } =
    useLoaderData<typeof loader>();
  // console.log(pageLinks);
  console.log(recapHeadlines);

  return (
    <main className="container px-4 py-16 mx-auto w-full">
      <h1>Boyner Ramblers</h1>
      <div className="my-8">
        {/* found how many numberOfPages? I want a sentence saying how many will need to be fetched! */}
        <div>{numberOfPages} pages</div>
        {recapHeadlines.map((headline, i) => {
          const date = new Date(headline.modifiedGmt);
          const formattedDate = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "America/New_York",
          });

          return (
            <div key={i} className="py-2">
              <a href={headline.url} className="text-blue-500 hover:underline">
                {formattedDate}: {headline.title}
              </a>
            </div>
          );
        })}
      </div>
      <Form method="post">
        <Button type="submit">Logout</Button>
      </Form>
    </main>
  );
}
