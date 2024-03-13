import { SSRComponent, SSRComponentProps } from "../../../types";
import { unsafeRenderToString } from "./render";

const encoder = new TextEncoder();

function createReadableStreamFromAsyncGenerator(
  output: AsyncIterableIterator<any>
) {
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

function is_promise(value: any): value is Promise<any> {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}

export function renderToStream(_: SSRComponent, props?: SSRComponentProps) {
  let currentId = 0;
  let pending = new Set<number>();

  let controller_: ReadableStreamDefaultController<
    [id: number, value: unknown]
  >;

  const stream = new ReadableStream({
    start(controller) {
      controller_ = controller;
    },
  });

  const cleanup = () => {
    controller_.close();
    // @ts-expect-error
    delete globalThis.__suspend__;
  };

  // @ts-expect-error
  globalThis.__suspend__ = function suspend({
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
    )
      .then((props) => {
        const result = component.render(Object.fromEntries(props));
        controller_?.enqueue?.([id, result.html]);
      })
      .catch((e) => {
        controller_.error(e);
      });

    return id;
  };

  async function* ren() {
    yield unsafeRenderToString(_, props);

    // Immediately close the stream if Suspense was not used.
    if (pending.size <= 0) cleanup();

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
    for await (const [id, value] of stream) {
      yield `<template data-suspense="${id}">${value}</template><script data-suspense-insert="${id}">window.__SUSPENSE_INSERT__(${id});</script>`;

      pending.delete(id);

      if (pending.size <= 0) cleanup();
    }
  }

  return new Response(createReadableStreamFromAsyncGenerator(ren()), {
    headers: { "Content-Type": "text/html" },
  });
}
