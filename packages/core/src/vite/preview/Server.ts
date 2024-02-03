import path from "node:path";
import { pathToFileURL } from "node:url";

import type { PreviewServer } from "vite";

import sirv from "sirv";

import type { Hono } from "hono";

import { getRequest, setResponse } from "../devServer/Utils.js";
import { shouldPolyfill } from "../utils/platform.js";
import { installPolyfills } from "../utils/polyfill.js";

export async function previewServer(server: PreviewServer) {
  if (shouldPolyfill) {
    installPolyfills();
  }

  const protocol = server.config.preview.https ? "https" : "http";

  const publicDir = server.config.publicDir;
  const { outDir, assetsDir } = server.config.build;

  const module = await import(
    pathToFileURL(path.join(outDir, "index.js")).href
  );

  const app: Hono = module.default;

  server.middlewares.use(
    sirv(publicDir, {
      setHeaders: (res, pathname) => {
        // only apply to build output directory
        if (pathname.startsWith(`/${assetsDir}`)) {
          res.setHeader("cache-control", "public,max-age=31536000,immutable");
        }
      },
    })
  );

  server.middlewares.use(async (req, res) => {
    const host = req.headers["host"];
    const request = getRequest({ request: req, base: `${protocol}://${host}` });
    const response = await app.fetch(request);
    setResponse(res, response);
  });
}
