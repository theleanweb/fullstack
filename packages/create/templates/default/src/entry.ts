import { Hono } from "hono";
import { Render } from "@leanweb/fullstack/runtime";

import Home from "./views/pages/home.svelte?ssr";
import NotFound from "./views/errors/not_found.svelte?ssr";
import ServerError from "./views/errors/server_error.svelte?ssr";

const app = new Hono();

app.get("/", (ctx) => ctx.html(Render.renderSSR(Home, {})));

app.notFound((ctx) => {
  return ctx.html(Render.renderSSR(NotFound, {}));
});

app.onError((error, ctx) => {
  return ctx.html(Render.renderSSR(ServerError, { error }));
});

export default app;
