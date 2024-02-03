// @ts-check

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import router from "./dist/index.js";

router.use("/*", serveStatic({ root: "./public" }));

const server = serve({ fetch: router.fetch, port: 4000 });

server.listen(() => {
  console.log("Server running");
});
