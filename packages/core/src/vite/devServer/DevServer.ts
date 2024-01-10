import path from "node:path";

import type { ViteDevServer } from "vite";
import { isCSSRequest } from "vite";

import type { Hono } from "hono";

import * as Option from "effect/Option";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";

import * as AssetRef from "./assetRef/AssetRef.js";
import { getRequest, setResponse, to_fs } from "./Utils.js";

export function devServer(
  server: ViteDevServer,
  opts: { entry: string; cwd: string }
) {
  const serve_static_middleware = server.middlewares.stack.find(
    (middleware) =>
      (middleware.handle as Function).name === "viteServeStaticMiddleware"
  );

  function resolve(id: string) {
    return Effect.gen(function* (_) {
      const url = id.startsWith("..")
        ? `/@fs${path.posix.resolve(id)}`
        : `/${id}`;

      const [module, moduleNode] = yield* _(
        Effect.all([
          Effect.tryPromise(() => server.ssrLoadModule(url)),
          Effect.tryPromise(() => server.moduleGraph.getModuleByUrl(url)),
        ])
      );

      if (!moduleNode) {
        return yield* _(
          Effect.fail(new Error(`Could not find node for ${url}`))
        );
      }

      return { url, module, moduleNode };
    });
  }

  server.middlewares.use(async (req, res, next) => {
    const base = `${server.config.server.https ? "https" : "http"}://${
      req.headers[":authority"] || req.headers.host
    }`;

    const url = new URL(base + req.url);
    const decoded = decodeURI(url.pathname);

    const assetRef = pipe(
      Option.fromNullable(url.searchParams.get(AssetRef.PREFIX)),
      Option.map((_) => path.join(opts.cwd, _))
    );

    if (isCSSRequest(decoded)) {
      if (Option.isSome(assetRef)) {
        const _ = await Effect.runPromise(resolve(assetRef.value));
        res.writeHead(200, { "content-type": "text/css" });
        res.end(`import '${to_fs(_.module.default)}';`);
      }

      return;
    }

    if (Option.isSome(assetRef)) {
      res.writeHead(200, { "content-type": "application/javascript" });
      res.end(`import '${to_fs(assetRef.value)}';`);
      return;
    }

    const request = getRequest({ base, request: req });
    const serverEntry = await server.ssrLoadModule(opts.entry);

    const app: Hono = serverEntry.default;

    const response = await app.fetch(request);

    if (response.status === 404) {
      // @ts-expect-error
      serve_static_middleware?.handle(req, res, () => {
        setResponse(res, response);
      });
    } else {
      setResponse(res, response);
    }
  });
}

const script_file_regex = /\.(js|ts|mjs|mts)$/;

function isScriptRequest(url: string) {
  return script_file_regex.test(url);
}
