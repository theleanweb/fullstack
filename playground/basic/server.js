// @ts-check

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import router from "./dist/entry.js";

router.use(
  "/assets/*",
  serveStatic({
    root: "./public",
    rewriteRequestPath: (path) => path.replace(/^\/assets/, "/build"),
  })
);

router.use("/*", serveStatic({ root: "./public" }));

serve({fetch: router.fetch, port: 4000});

console.log("Server running");
