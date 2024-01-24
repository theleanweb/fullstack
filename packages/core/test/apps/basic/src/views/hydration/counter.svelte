<script lang="ts">
  import { onMount } from "svelte";

  export let count: number;

  onMount(() => {
    setInterval(() => {
      count = count + 1;
    }, 1000);
  });
</script>

<p>{count}</p>
