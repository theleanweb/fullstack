import { Hono } from "hono";
import { Render } from "@leanweb/fullstack/runtime";
import Home from "./views/home.svelte?ssr";

const app = new Hono();

app.get("/", (ctx) => ctx.html(Render.renderSSR(Home, {})));

export default app;
