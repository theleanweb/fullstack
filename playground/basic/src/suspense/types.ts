import type { SvelteComponent } from "svelte";

export interface SuspenseStore {
  set(data: { component: SvelteComponent; props: Record<string, any> }): number;
}
