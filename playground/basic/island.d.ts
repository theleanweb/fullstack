// import {
//   SvelteHTMLElements,
//   AriaAttributes,
//   DOMAttributes,
// } from "svelte/elements";

// import type { SvelteComponent, ComponentProps } from "svelte";

// import Island from "./src/views/Island.svelte";

declare module "svelte/elements" {
  // export interface SvelteHTMLElements {
  //   "custom-button": HTMLButtonAttributes;
  // }

  // // allows for more granular control over what element to add the typings to
  // export interface HTMLButtonAttributes {
  //   __island?: boolean;
  // }

  // export interface AriaAttributes {
  //   "aria-__island"?: boolean;
  // }

  export interface HTMLAttributes<T> {
    __island?: boolean;
  }

  // export interface SvelteHTMLElements {
  //   [name: string]: HTMLButtonAttributes;
  // }

  // export interface IntrinsicAttributes {
  //   slots: string;
  // }
}

// declare global {
//   class SvelteComponentDev {
//     $$prop_def: { slots: string };
//   }
// }

declare module "./src/views/Island.svelte" {
  // const Component: import("./src/views/Island.svelte");
  // const n: SvelteComponent<ComponentProps<Island>>;
  // export default n;
  // type n = SvelteComponent<ComponentProps<Island>>;
  // export interface $$Props extends SvelteComponent<ComponentProps<Island>> {
  //   prop: boolean;
  // }

  export const __island: boolean;
}

// declare namespace svelteHTML.JSX {
//   export interface IntrinsicAttributes {
//     slots: string;
//   }
// }

// declare namespace svelteHTML {
//   interface IntrinsicElements {
//     "example-element": {
//       name: number;
//     };
//   }
// }

// Declare an interface for additional props
interface CustomComponentProps {
  customProp: string;
}

// Use module augmentation to extend the existing props interface
// without importing HTMLProps directly
declare module "svelte" {
  export interface $$Props<T> {
    customComponent?: boolean;
  }
}

export {};
