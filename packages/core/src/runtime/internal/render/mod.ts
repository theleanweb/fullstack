import { load } from "cheerio";
import * as Either from "effect/Either";

import {
  SSRComponent,
  SSRComponentProps,
  SSRComponentOutput,
  SSRComponentOptions,
} from "../../../types.js";

import { is_promise, readableStreamFromAsyncIterable } from "./utils.js";

export function render(_: SSRComponentOutput) {
  const document = load(_.html);
  const head = document("head");
  head.append(_.head);
  if (_.css.code) head.append(`<style>${_.css.code}</style>`);
  return document.html();
}

export function unsafeRenderToString(
  _: SSRComponent | SSRComponentOutput,
  props: SSRComponentProps = {},
  options: SSRComponentOptions = {}
): string {
  let output: SSRComponentOutput;

  if ("html" in _) {
    output = _;
  } else {
    if ("render" in _ && typeof _.render == "function") {
      output = _.render(props, options);
    } else {
      throw new Error("Not a valid SSR component");
    }
  }

  return render(output);
}

export class RenderError {
  readonly _tag = "RenderError";
  constructor(public cause: unknown) {}
}

export function renderToString(_: SSRComponent, props?: SSRComponentProps) {
  return Either.try({
    try: () => unsafeRenderToString(_, props),
    catch: (e) => new RenderError(e),
  });
}

export interface SSRComponentExport {
  default: SSRComponent;
}

type Lazy<T> = () => Promise<T>;

const isLazy = <T>(value: any): value is Lazy<T> => {
  return typeof value == "function";
};

export function resolveComponent<T>(
  path: string,
  components: T
): T extends Record<string, infer R>
  ? R extends Lazy<infer R1>
    ? R1 extends SSRComponentExport
      ? Promise<SSRComponent>
      : never
    : R extends SSRComponentExport
    ? SSRComponent
    : never
  : never {
  const components_ = components as Record<
    string,
    SSRComponentExport | Lazy<SSRComponentExport>
  >;
  const entry = components_[path];
  // @ts-expect-error
  return isLazy(entry) ? entry().then((_) => _.default) : entry.default;
}

export interface Views {
  // [k:string]: SSRComponentProps
}

export function makeFactory<T extends SSRComponent | Promise<SSRComponent>>(
  f: (name: string) => T
) {
  return <V extends Views, K extends keyof V>(
    name: K,
    props?: V[K]
  ): T extends Promise<SSRComponent> ? Promise<string> : string => {
    // @ts-expect-error
    const output = f(name);
    // @ts-expect-error
    return output instanceof Promise
      ? output.then((_) => unsafeRenderToString(_, props as SSRComponentProps))
      : unsafeRenderToString(output, props as SSRComponentProps);
  };
}

export const SUSPENDER_CONTEXT_KEY = "__suspend__";

export function renderToStream(
  _: SSRComponent,
  props?: SSRComponentProps,
  init?: ResponseInit
) {
  let current_id = 0;
  const pending = new Set<number>();

  let controller_: ReadableStreamDefaultController<[id: number, chunk: string]>;

  const stream = new ReadableStream({
    start(controller) {
      controller_ = controller;
    },
  });

  const cleanup = () => {
    controller_.close();
  };

  const suspend = function suspend({
    props,
    component,
  }: {
    component: any;
    props: Record<string, any>;
  }) {
    const id = current_id++;

    pending.add(id);

    Promise.all(
      Object.entries(props).map(async ([n, v]) => {
        return [n, is_promise(v) ? await v : v];
      })
    )
      .then((entries) => {
        const props = Object.fromEntries(entries);
        const context = new Map([[SUSPENDER_CONTEXT_KEY, suspend]]);
        const result = render(component.render(props, { context }));
        controller_.enqueue([id, result]);
      })
      .catch((e) => {
        controller_.error(e);
      });

    return id;
  };

  const context = new Map([[SUSPENDER_CONTEXT_KEY, suspend]]);

  async function* ren() {
    yield render(_.render(props, { context }));

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

  return new Response(readableStreamFromAsyncIterable(ren()), {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "text/html",
    },
  });
}
