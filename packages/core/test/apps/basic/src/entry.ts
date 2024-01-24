import { Hono } from "hono";

import Home from "./views/home.svelte?ssr";
import About from "./views/about.svx?ssr";
import Hydrate from "./views/hydration/page.svelte?ssr";

const app = new Hono();

// SSR
app.get("/", (ctx) => ctx.html(Home.render({}).html));
app.get("/about", (ctx) => ctx.html(About.render({}).html));

app.get("/hydrate/:count?", (ctx) => {
  const count = ctx.req.param("count");
  return ctx.html(Hydrate.render({ count }).html);
});

// API
app.get("/api", (ctx) => ctx.json({ name: "fullstack" }));

app.post("/api/count", async (ctx) => {
  const body = await ctx.req.json();
  return ctx.json({ count: (body.count ?? 0) + 1 });
});

export default app;
