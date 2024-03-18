import { Hono, type Context, type Handler } from "hono";
import { stream } from "hono/streaming";

import { Render } from "@leanweb/fullstack/runtime";
import { createCookieSessionStorage } from "@leanweb/fullstack/runtime/Session";

import { telefunc } from "telefunc";


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

const encoder = new TextEncoder();

function createReadableStreamFromAsyncGenerator(output: AsyncIterableIterator<any>) {
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
  _: SSRComponent,
  props?: SSRComponentProps
) {
  let currentId = 0;
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

  const cleanup = () => {
    streamController.close();
  }

  const suspend = function suspend({
    props,
    component,
  }: {
    component: any;
    props: Record<string, any>;
  }) {
    const id = currentId++;

    pending.add(id);

    Promise.all(
      Object.entries(props).map(async ([name, val]) => {
        return [name, is_promise(val) ? await val : val];
      })
    ).then((props) => {
      const result = component.render(Object.fromEntries(props));
      streamController?.enqueue?.([id, result.html]);
    }).catch(e => {
      streamController.error(e)
    })

    return id;
  };

  const context = new Map([['__suspend__', suspend]])

  async function* ren() {
    yield Render.render(_.render(props, {context}))

    // Immediately close the stream if Suspense was not used.
    if (pending.size <= 0) cleanup()

    // Send a script to query for the fallback and replace with content.
		// This is grouped into a global __SUSPENSE_INSERT__
		// to reduce the payload size for multiple suspense boundaries.
		yield `
    <script>
      window.__SUSPENSE_INSERT__ = function (idx) {
        var script = document.querySelector('[data-suspense-insert="' + idx + '"]')
        var template = document.querySelector('[data-suspense="' + idx + '"]');
        var dest = document.querySelector('[data-suspense-fallback="' + idx + '"]');
        dest.replaceWith(template.content);
        template.remove();
        script.remove();
      }
    </script>
    `;

    // @ts-expect-error
    for await (const [id, value] of _stream) {
      yield `
      <template data-suspense="${id}">${value}</template>
      <script data-suspense-insert="${id}">window.__SUSPENSE_INSERT__(${id});</script>
      `;

      pending.delete(id);

      if (pending.size <= 0) cleanup()
    }
  }

  return new Response(createReadableStreamFromAsyncGenerator(ren()), {
    headers: {'Content-Type': 'text/html'}
  })

  // return stream(ctx, async (stream) => {
  //   ctx.res.headers.set("Content-Type", "text/html");
  //   await stream.pipe(createReadableStreamFromAsyncGenerator(ren()));
  // });
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

  return Render.renderToStream(Sus);
  
  // return ctx.html(Render.unsafeRenderToString(Sus))

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
