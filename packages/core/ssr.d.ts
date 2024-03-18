interface SSRComponentOutput {
  html: string;
  head: string;
  css: { map: any; code: string };
}

type SSRComponentProps = Record<string, any>;

export type SSRComponentOptions = {
  $$slots?: Record<string, any>;
  context?: Map<string, any>;
};

interface SSRComponent {
  render(props: SSRComponentProps, options?: SSRComponentOptions): SSRComponentOutput;
}

declare module "*.svelte?ssr" {
  const Component: SSRComponent;
  export default Component;
}

declare module "*.svx?ssr" {
  const Component: SSRComponent;
  export const metadata: Record<string, string>;
  export default Component;
}

declare module "*.svx" {
  import { ComponentConstructorOptions, SvelteComponent } from "svelte";

  const Component: {
    new (options: ComponentConstructorOptions): SvelteComponent;
  };

  export default Component;
}
