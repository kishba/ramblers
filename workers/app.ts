import { drizzle } from "drizzle-orm/d1";
import { createRequestHandler, createCookieSessionStorage } from "react-router";

import { DatabaseContext } from "~/database/context";
import * as schema from "~/database/schema";
import { SessionContext } from "~/lib/session";

interface CloudflareEnvironment {
  DB: D1Database;
  SESSION_SECRET: string;
}

declare module "react-router" {
  export interface AppLoadContext {
    VALUE_FROM_CLOUDFLARE: string;
  }
}

const requestHandler = createRequestHandler(
  // @ts-expect-error - virtual module provided by React Router at build time
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env) {
    const db = drizzle(env.DB, { schema });
    const sessionStorage = createCookieSessionStorage({
      cookie: {
        path: "/",
        sameSite: "lax",
        secrets: [env.SESSION_SECRET],
        secure: request.url.startsWith("https://"),
      },
    });

    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );
    const lastSetCookie = await sessionStorage.commitSession(session);

    const response = await DatabaseContext.run(db, () =>
      SessionContext.run(session, () =>
        requestHandler(request, {
          VALUE_FROM_CLOUDFLARE: "Hello from Cloudflare",
        })
      )
    );

    const setCookie = await sessionStorage.commitSession(session);
    if (lastSetCookie !== setCookie) {
      const headers = new Headers(response.headers);
      headers.append("Set-Cookie", setCookie);

      return new Response(response.body, {
        cf: response.cf,
        headers,
        status: response.status,
        statusText: response.statusText,
        webSocket: response.webSocket,
      });
    }

    return response;
  },
} satisfies ExportedHandler<CloudflareEnvironment>;
