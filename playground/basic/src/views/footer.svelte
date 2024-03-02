<script lang="ts">
  import { onMount } from "svelte";
  import Count from "../count.svelte";

  export let count: number;

  let doubled: number;
  $: doubled = count * 2;

  const click = () => {
    console.log("click");
  };

  onMount(() => {
    setInterval(() => {
      count = count + 1;
    }, 1000);
  });
</script>

<!-- <link rel="stylesheet" href="./footer.css" id="footer-css" /> -->

<p>double: {doubled}</p>

<button on:click="{click}">click</button>

<footer>footer <Count {count} /></footer>

<style>
  footer {
    background-color: yellow;
  }
</style>
