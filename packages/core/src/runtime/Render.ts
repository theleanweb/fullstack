import { SSRComponent, SSRComponentOutput } from "../types.js";

import * as internal from "./internal/render.js";

export const render: (_: SSRComponentOutput) => string = internal.render;

export function renderSSR(output: SSRComponentOutput): string;
export function renderSSR<T>(
  component: T,
  props: T extends SSRComponent<infer P> ? P : never
): string;
export function renderSSR<T>(
  componentOrOutput: T | SSRComponentOutput,
  props?: T extends SSRComponent<infer P> ? P : never
): string {
  // @ts-expect-error
  return internal.renderSSR(componentOrOutput, props);
}
