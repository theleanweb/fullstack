<script lang="ts" context="module">
  declare function __suspend__(
    ...args: Parameters<SuspenseStore["set"]>
  ): number;
</script>

<script lang="ts">
  import type { SuspenseStore } from "./types";

  function is_promise(value: any): value is Promise<any> {
    return (
      !!value &&
      (typeof value === "object" || typeof value === "function") &&
      typeof value.then === "function"
    );
  }

  const suspend = "__suspend__" in globalThis ? __suspend__ : null;

  console.log(suspend);

  export let component: any;

  const id = suspend?.({ props: $$restProps, component }) ?? null;

  const promises =
    id == null
      ? Promise.all(
          Object.entries($$restProps).map(async ([name, val]) => {
            return [name, is_promise(val) ? await val : val];
          })
        )
      : null;
</script>

{#if id !== null}
  <div data-suspense-fallback={id} style="display: contents;">
    <slot name="fallback" />
  </div>
{:else if promises}
  {#await promises}
    <slot name="fallback" />
  {:then props}
    <svelte:component this={component} {...Object.fromEntries(props)} />
  {/await}
{:else}
  <slot name="fallback" />
{/if}

<slot />
