import { Hono } from "hono";

import {lazy} from '@leanweb/fullstack/runtime/internal/resource'

import { render } from "./setup/render.js";

const app = new Hono();

app.get("/", async (ctx) => ctx.html(await render("welcome", {})));
app.get("/user", async (ctx) => ctx.html(await render("user/post", {})));

app.get('/user/:id', lazy(async () => (await import('./user.js')).show))

export default app;
