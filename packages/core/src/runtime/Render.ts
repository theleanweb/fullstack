import {
  SSRComponent,
  SSRComponentOutput,
  SSRComponentProps,
} from "../types.js";

import * as internal from "./internal/render.js";

export const render: (_: SSRComponentOutput) => string = internal.render;

export function renderSSR(output: SSRComponentOutput): string;
export function renderSSR(
  component: SSRComponent,
  props: SSRComponentProps
): string;
export function renderSSR(
  componentOrOutput: SSRComponent | SSRComponentOutput,
  props?: SSRComponentProps
): string {
  return internal.renderSSR(componentOrOutput, props);
}
