import {
  makeFactory,
  resolveComponent,
  type SSRComponentExport,
} from "@leanweb/fullstack/runtime/Render";

const components = import.meta.glob<SSRComponentExport>(
  "../views/**/*.svelte",
  { query: { ssr: true }, eager: true }
);

export const render = makeFactory((name) => {
  return resolveComponent(`../views/${name}.svelte`, components);
});
