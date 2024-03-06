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
