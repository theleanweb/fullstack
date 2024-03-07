import { Hono } from "hono";

import {lazy} from '@leanweb/fullstack/runtime/internal/resource'

import { render } from "./setup/render.js";

const app = new Hono();

app.get("/", (ctx) => ctx.html(render("welcome", {})));
app.get("/user", (ctx) => ctx.html(render("user/post", {})));

app.get('/user/:id', lazy(async () => (await import('./user.js')).show))

export default app;
