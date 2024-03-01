import { Hono } from "hono";

import { Render } from "@leanweb/fullstack/runtime";

import Home from "./views/home.svelte?ssr";
// import { loader, action } from "./views/home.svelte";

const app = new Hono();

app.get("/", async (ctx) => {
  //   const data = loader();
  let data = {};
  return ctx.html(Render.renderSSR(Home, { count: 1, data }));
});

app.post("/", (ctx) => {
  //   const data = action();
  //   console.log(data);
  return ctx.redirect("/");
});

export default app;
