<script lang="ts">
  import { onMount } from "svelte";

  // interface $$Props {
  //   // prop: boolean;
  //   count: number;
  // }

  export let __island: boolean = true;
  export let count = 0;
  // export let child: any;

  onMount(() => {
    setInterval(() => {
      count = count + 1;
    }, 1000);
  });
</script>

<h1>Island</h1>

<!-- <code>island = {__island}</code> -->
<p>count: {count}</p>

<hr style="background: red" />

<!-- <h1>Child</h1>

<hr />

<svelte:component this="{child}" />

<hr /> -->
