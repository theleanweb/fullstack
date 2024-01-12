import { Hono } from "hono";
// import { Render } from "core";

import { Render } from "@leanweb/fullstack/runtime";

import Home from "./views/home.svelte?ssr";

import Footer_ from "@/views/footer.svelte?ssr";

import About from "./views/about.svx?ssr";

const app = new Hono();

// Footer_

console.log(Home);

app.get("/", (ctx) => ctx.html('Go to <a href="/about">About</a>'));

app.get("/home/:id?", (ctx) => {
  const id = ctx.req.param("id");
  const count = id !== undefined ? parseFloat(id) : 10;
  return ctx.html(Render.renderSSR(Home, { count }));
});

app.get("/about", (ctx) => ctx.html(Render.renderSSR(About, { count: 5 })));

export default app;
