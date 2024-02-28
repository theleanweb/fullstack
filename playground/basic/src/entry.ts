import { Hono } from "hono";

import { Render } from "@leanweb/fullstack/runtime";
import { createCookieSessionStorage } from "@leanweb/fullstack/runtime/Session";

import Home from "./views/home.svelte?ssr";
import About from "./views/about.svx?ssr";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__session",

      // all of these are optional
      // domain: "remix.run",
      // Expires can also be set (although maxAge overrides it when used in combination).
      // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
      //
      // expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      maxAge: 60,
      path: "/",
      sameSite: "lax",
      secrets: ["s3cret1"],
      secure: true,
    },
  });

const app = new Hono();

app.get("/", async (ctx) => {
  const session = await getSession(ctx.req.raw.headers.get("Cookie"));

  session.flash("error", "Invalid username/password");

  return ctx.html('Go to <a href="/home">About 4</a>', {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
});

app.get("/home/:id?", async (ctx) => {
  const id = ctx.req.param("id");
  const count = id !== undefined ? parseFloat(id) : 11;

  const session = await getSession(ctx.req.raw.headers.get("Cookie"));

  console.log({ error: session.get("error") });

  return ctx.html(Render.renderSSR(Home, { count }), {headers: {
    "Set-Cookie": await commitSession(session),
  },});
});

// app.get("/about", (ctx) => ctx.html(Render.renderSSR(About, { count: 5 })));

export default app;
