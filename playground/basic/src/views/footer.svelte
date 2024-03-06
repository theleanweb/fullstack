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

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link rel="icon" href="/favicon.png" />
    <!-- <link rel="stylesheet" href="./main.css" />
    <link rel="stylesheet" href="./style.css" /> -->
    <link rel="stylesheet" href="./main.css" />
    <link rel="stylesheet" href="./style.css" />
    <!-- <link rel="stylesheet" id="mustache" {href} /> -->
    <script type="module" src="./script.ts"></script>
    <title>40 Document</title>
    <!-- <Footer {count} /> -->
  </head>
  <body>
    <p class="p-4 bg-red-500">Hello 3000</p>

    <!-- <p class="w-full">Hello 3000</p>

    <ion-button>Default</ion-button>
    <ion-button disabled="true">Disabled</ion-button> -->

    <!-- <div>ages: {JSON.stringify({ age: list })}</div> -->

    <img src="/favicon.png" alt="favicon" />

    <!-- <Island count={0} /> -->

    <!-- <Footer {count} /> -->

    <!-- <custom-button __island aria></custom-button> -->

    <!-- {#each num as n}
      <p>{n}</p>
    {/each} -->

    <!-- <section use:hydrate>
      <h1>Footer here</h1>
      <Footer count={5} />
    </section>

    <div class="counter">
      {@html counter}
    </div>

    {@html `<script id="data" type="application/json">${data}</script>`} -->

    <p>
      <script type="module" src="./script.ts"></script>
    </p>
  </body>
</html>

<style>
  .comment {
    background-color: yellow;
  }
</style>
