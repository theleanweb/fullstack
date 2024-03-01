// import { Hono } from "hono";

// import { Render } from "@leanweb/fullstack/runtime";

// import Home from "./views/home.svelte?ssr";
// import About from "./views/about.svx?ssr";

// const app = new Hono();

// app.get("/", (ctx) => ctx.html('Go to <a href="/about">About 4</a>'));

// app.get("/home/:id?", (ctx) => {
//   const id = ctx.req.param("id");
//   const count = id !== undefined ? parseFloat(id) : 11;
//   return ctx.html(Render.renderSSR(Home, { count }));
// });

// // app.get("/about", (ctx) => ctx.html(Render.renderSSR(About, { count: 5 })));

// export default app;

import app from "./controllers/mod.js";

export default app;
