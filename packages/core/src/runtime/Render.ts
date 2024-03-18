import {
  SSRComponent,
  SSRComponentOutput,
  SSRComponentProps,
  SSRComponentOptions,
} from "../types.js";

import * as internal from "./internal/render/mod.js";

export const render: (_: SSRComponentOutput) => string = internal.render;

export function unsafeRenderToString(
  componentOrOutput: SSRComponent | SSRComponentOutput,
  props?: SSRComponentProps,
  options?: SSRComponentOptions
): string {
  return internal.unsafeRenderToString(componentOrOutput, props, options);
}

export function renderToStream(
  component: SSRComponent,
  props?: SSRComponentProps,
  init?: ResponseInit
): Response {
  return internal.renderToStream(component, props, init);
}

export {
  SSRComponentExport,
  resolveComponent,
  makeFactory,
  Views,
} from "./internal/render/mod.js";
