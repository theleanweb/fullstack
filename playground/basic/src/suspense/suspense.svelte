<script lang="ts">
  import { getContext } from "svelte";
  import type { SuspenseStore } from "./types";
  import type { SvelteComponent, ComponentProps } from "svelte";

  export let component: SvelteComponent;

  interface $$Props extends ComponentProps<typeof component> {}

  const suspense_store = getContext<SuspenseStore>("suspense_store");

  const id = suspense_store.set({ props: $$restProps, component });

  console.log("id: ", $$slots, $$restProps);
</script>

<div data-fallback={id} style="display: contents;">
  <slot name="fallback" />
</div>

<slot />
