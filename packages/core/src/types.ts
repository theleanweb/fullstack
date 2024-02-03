export interface SSRComponentOutput {
  html: string;
  head: string;
  css: { map: any; code: string };
}

export type SSRComponentProps = Record<string, any>;

export interface SSRComponent<T extends SSRComponentProps> {
  render(props: T): SSRComponentOutput;
}
