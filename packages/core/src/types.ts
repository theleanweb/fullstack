export interface SSRComponentOutput {
  html: string;
  head: string;
  css: { map: any; code: string };
}

export type SSRComponentProps = Record<string, any>;

export type SSRComponentOptions = {
  $$slots?: Record<string, any>;
  context?: Map<string, any>;
};

export interface SSRComponent {
  render(
    props?: SSRComponentProps,
    options?: SSRComponentOptions
  ): SSRComponentOutput;
}
