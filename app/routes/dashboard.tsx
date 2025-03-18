import { Form, redirect, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { requireUser, setUserId } from "~/lib/session";
import { scrapeArticles } from "~/lib/scraper";

interface Headline {
  title: string;
  url: string;
}

// Simple handler that just extracts article headlines
class HeadlineHandler {
  headlines: Headline[] = [];
  currentTitle: string = "";
  currentUrl: string = "";

  element(element: Element) {
    // We're only interested in the headline links
    if (
      element.tagName === "a" &&
      element.hasAttribute("class") &&
      element.getAttribute("class")?.includes("article-title")
    ) {
      // Store the URL when we find the link
      this.currentUrl = element.getAttribute("href") || "";
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
        });

        // Reset for the next headline
        this.currentTitle = "";
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

    // Apply the HTML rewriter focused only on headline links
    const transformed = new HTMLRewriter()
      .on("a.article-title", handler)
      .transform(response);

    // Process the entire response
    await transformed.text();

    console.log(`Found ${handler.headlines.length} headlines`);

    // Return just the headlines
    return {
      headlines: handler.headlines,
      count: handler.headlines.length,
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
  const { headlines } = useLoaderData<typeof loader>();

  return (
    <main className="container px-4 py-16 mx-auto w-full">
      <h1>Boyner Ramblers</h1>
      <div className="my-8">
        {headlines.map((headline, i) => (
          <div key={i} className="py-2">
            <a href={headline.url} className="text-blue-500 hover:underline">
              {headline.title}
            </a>
          </div>
        ))}
      </div>
      <Form method="post">
        <Button type="submit">Logout</Button>
      </Form>
    </main>
  );
}
