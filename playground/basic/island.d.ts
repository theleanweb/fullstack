import { SvelteHTMLElements, AriaAttributes } from "svelte/elements";

declare module "svelte/elements" {
  export interface SvelteHTMLElements {
    "custom-button": HTMLButtonAttributes;
  }

  // allows for more granular control over what element to add the typings to
  export interface HTMLButtonAttributes {
    __island?: boolean;
  }

  export interface AriaAttributes {
    "aria-__island"?: boolean;
  }
}

export {};
