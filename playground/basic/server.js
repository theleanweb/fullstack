// @ts-check

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import router from "./dist/index.js";

router.use("/*", serveStatic({ root: "./public" }));

serve(router, (info) => {
  console.log(`Server running ${info.address}:${info.port}`);
});
