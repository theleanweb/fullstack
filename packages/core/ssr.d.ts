interface SSRComponentOutput {
  html: string;
  head: string;
  css: { map: any; code: string };
}

type SSRComponentProps = Record<string, any>;

interface SSRComponent<T> {
  render(props: T): SSRComponentOutput;
}

declare module "*.svelte?ssr" {
  export interface Props {}

  const Component: SSRComponent<Props>;
  export default Component;
}

declare module "*.svx?ssr" {
  const Component: SSRComponent<any>;
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
