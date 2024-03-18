<script lang="ts">
  import { getContext } from "svelte";
  import type { SuspenseStore } from "./types";

  function is_promise(value: any): value is Promise<any> {
    return (
      !!value &&
      (typeof value === "object" || typeof value === "function") &&
      typeof value.then === "function"
    );
  }

  const suspend =
    getContext<(...args: Parameters<SuspenseStore["set"]>) => number>(
      "__suspend__"
    );

  export let component: any;

  const id = suspend?.({ props: $$restProps, component }) ?? null;
</script>

{#if id !== null}
  <div data-suspense-fallback={id} style="display: contents;">
    <slot name="fallback" />
  </div>
{:else}
  {@const promises = Promise.all(
    Object.entries($$restProps).map(async ([n, v]) => {
      return [n, is_promise(v) ? await v : v];
    })
  )}

  {#await promises}
    <slot name="fallback" />
  {:then props}
    <svelte:component this={component} {...Object.fromEntries(props)} />
  {/await}
{/if}

<slot />
