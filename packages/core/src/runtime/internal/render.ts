import { load } from "cheerio";
import * as Either from "effect/Either";

import {
  SSRComponent,
  SSRComponentProps,
  SSRComponentOutput,
} from "../../types.js";

export function render(_: SSRComponentOutput) {
  const document = load(_.html);
  const head = document("head");
  head.append(_.head);
  if (_.css.code) head.append(`<style>${_.css.code}</style>`);
  return document.html();
}

export function unsafeRenderToString(
  _: SSRComponent | SSRComponentOutput,
  props?: SSRComponentProps
): string {
  let output: SSRComponentOutput;

  if ("html" in _) {
    output = _;
  } else {
    if ("render" in _ && typeof _.render == "function") {
      output = _.render(props ?? {});
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

export function makeFactory<T extends SSRComponent | Promise<SSRComponent>>(
  f: (name: string) => T
) {
  return (
    name: string,
    props?: SSRComponentProps
  ): T extends Promise<SSRComponent> ? Promise<string> : string => {
    const output = f(name);
    // @ts-expect-error
    return output instanceof Promise
      ? output.then((_) => unsafeRenderToString(_, props))
      : unsafeRenderToString(output, props);
  };
}
