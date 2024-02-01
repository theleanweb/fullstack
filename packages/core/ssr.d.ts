declare module "*.svelte?ssr" {
  const Component: import("./dist/types.js").SSRComponent;
  export default Component;
}

declare module "*.svx?ssr" {
  const Component: import("./dist/types.js").SSRComponent;
  export const metadata: Record<string, string>;
  export default Component;
}

declare module "*.svx" {
  import {
    ComponentProps,
    SvelteComponent,
    ComponentConstructorOptions,
  } from "svelte";

  const Component: {
    new (options: ComponentConstructorOptions): SvelteComponent;
  };

  export default Component;
}
