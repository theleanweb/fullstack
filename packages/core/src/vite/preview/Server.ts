import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { PreviewServer } from "vite";

import mime from "mime";

import type { Hono } from "hono";

import { getRequest, setResponse } from "../devServer/Utils.js";
import { shouldPolyfill } from "../utils/platform.js";
import { installPolyfills } from "../utils/polyfill.js";

export async function previewServer(server: PreviewServer) {
  if (shouldPolyfill) {
    installPolyfills();
  }

  const protocol = server.config.preview.https ? "https" : "http";

  const dir = server.config.build.outDir;
  const publicDir = server.config.publicDir;

  const module = await import(pathToFileURL(path.join(dir, "index.js")).href);

  const app: Hono = module.default;

  server.middlewares.use((req, res, next) => {
    const host = req.headers["host"];
    const base = `${protocol}://${host}`;
    const url = new URL(base + req.url);
    const decoded = decodeURI(url.pathname);

    const contentType = mime.getType(url.pathname);
    const rewrite = decoded.replace(/^\/assets/, "/build");

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    const file = path.join(publicDir, rewrite);

    if (fs.existsSync(file)) {
      const contents = fs.createReadStream(file);
      contents.pipe(res);
    } else {
      next();
    }
  });

  server.middlewares.use(async (req, res) => {
    const host = req.headers["host"];
    const request = getRequest({ request: req, base: `${protocol}://${host}` });
    const response = await app.fetch(request);
    setResponse(res, response);
  });
}
