import { Hono, type Handler, type Context } from "hono";
import { stream } from "hono/streaming";

import { Render } from "@leanweb/fullstack/runtime";
import { createCookieSessionStorage } from "@leanweb/fullstack/runtime/Session";

import { telefunc } from "telefunc";

import { getCount } from "./actions/count";

import Async from "./views/async.svelte?ssr";
import Home from "./views/home.svelte?ssr";
// import About from "./views/about.svx?ssr";
import Sus from "./views/sus/sus.svelte?ssr";

import {
  makeFactory,
  resolveComponent,
  type SSRComponentExport,
} from "@leanweb/fullstack/runtime/Render";

const components = import.meta.glob<SSRComponentExport>("./views/**/*.svelte", {
  query: { ssr: true },
  eager: true,
});

export const render = makeFactory((name) => {
  return resolveComponent(`./views/${name}.svelte`, components);
});

// render('home', {name: 'joe'})

const encoder = new TextEncoder();

function createReadableStreamFromAsyncGenerator(output) {
  return new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await output.next();

        if (done) {
          controller.close();
          break;
        }

        controller.enqueue(encoder.encode(value));
      }
    },
  });
}

export function renderToStream(
  ctx: Context,
  _: SSRComponent,
  props?: SSRComponentProps
) {
  let pending = new Set<number>();

  let streamController: ReadableStreamDefaultController<
    [id: number, value: unknown]
  >;

  const _stream = new ReadableStream({
    start(controller) {
      streamController = controller;
    },
  });

  function is_promise(value: any): value is Promise<any> {
    return (
      !!value &&
      (typeof value === "object" || typeof value === "function") &&
      typeof (/** @type {any} */ value.then) === "function"
    );
  }

  globalThis.__callback__ = function __callback__({
    props,
    component,
  }: {
    component: any;
    props: Record<string, any>;
  }) {
    const id = pending.size + 1;

    pending.add(id);

    Promise.all(
      Object.entries(props).map(async ([name, val]) => {
        return [name, is_promise(val) ? await val : val];
      })
    ).then((props) => {
      pending.delete(id);

      const context = new Map();

      context.set("suspense_store", { set: (args: any) => __callback__(args) });

      const result = component.render(Object.fromEntries(props), { context });
      streamController?.enqueue?.([id, result.html]);
      if (pending.size <= 0) streamController.close();
    });

    return id;
  };

  async function* ren() {
    yield _.render(props).html;

    for await (const [id, value] of _stream) {
      yield `
      <template data-suspense="${id}">${value}</template>
      <script>
      (() => {
        const template = document.querySelector('template[data-suspense="${id}"]');
        const fallback = document.querySelector('[data-fallback="${id}"]');
        fallback.replaceWith(template.content);
        template.remove();
      })()
      </script>
      `;
    }
  }

  // return new Response(ren(), {
  //   headers: {'Content-Type': 'text/html'}
  // })

  return stream(ctx, async (stream) => {
    ctx.res.headers.set("Content-Type", "text/html");
    await stream.pipe(createReadableStreamFromAsyncGenerator(ren()));
  });
}

// renderToStream(Sus)

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

// console.log(Async);

const app = new Hono();

const tele: Handler = async (ctx) => {
  const response = await telefunc({
    url: ctx.req.url,
    method: ctx.req.method,
    body: await ctx.req.text(),
    context: {
      // We pass the `context` object here, see https://telefunc.com/getContext
      someContext: "hello",
    },
  });

  return new Response(response.body, {
    headers: new Headers({ contentType: response.contentType }),
    status: response.statusCode,
  });
};

// app.get('/_telefunc', tele)
// app.post('/_telefunc', tele)

app.get("/", async (ctx) => {
  const session = await getSession(ctx.req.raw.headers.get("Cookie"));

  session.flash("error", "Invalid username/password");

  return renderToStream(ctx, Sus);

  // return ctx.html(Render.unsafeRenderToString(Home, {count: getCount()}), {
  //   headers: {
  //     "Content-Type": "text/html",
  //     "Set-Cookie": await commitSession(session),
  //   },
  // });
});

app.get("/home/:id?", async (ctx) => {
  const id = ctx.req.param("id");
  const count = id !== undefined ? parseFloat(id) : 11;

  const session = await getSession(ctx.req.raw.headers.get("Cookie"));

  console.log({ error: session.get("error") });

  return ctx.html(Render.unsafeRenderToString(Home, { count }), {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
});

// app.get("/async", (ctx) => ctx.html(Render.renderSSR(Async, { count: 5 })));

// app.get("/about", (ctx) => ctx.html(Render.renderSSR(About, { count: 5 })));

export default app;
