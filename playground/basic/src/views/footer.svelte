<script lang="ts">
  import { onMount } from "svelte";
  import Count from "../count.svelte";

  export let count: number = 0;

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

<!-- <style>
  footer {
    background-color: yellow;
  }
</style>
