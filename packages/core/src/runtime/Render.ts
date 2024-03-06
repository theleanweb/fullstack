import {
  SSRComponent,
  SSRComponentOutput,
  SSRComponentProps,
} from "../types.js";

import * as internal from "./internal/render.js";

export const render: (_: SSRComponentOutput) => string = internal.render;

export function unsafeRenderToString(
  componentOrOutput: SSRComponent | SSRComponentOutput,
  props?: SSRComponentProps
): string {
  return internal.unsafeRenderToString(componentOrOutput, props);
}
