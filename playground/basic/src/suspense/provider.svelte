<script lang="ts" context="module">
  declare function __callback__(
    ...args: Parameters<SuspenseStore["set"]>
  ): number;
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import type { SuspenseStore } from "./types";

  const send = __callback__;

  setContext<SuspenseStore>("suspense_store", {
    set: (args) => send(args),
  });
</script>

<slot />
