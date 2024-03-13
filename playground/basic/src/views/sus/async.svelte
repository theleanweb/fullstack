<script lang="ts">
  // import Suspense from "../../suspense/suspense.svelte";
  // import Async from "./async_2.svelte";

  export let name: string;

  // const delayed = <T,>(ms: number, data: T) =>
  //   new Promise<T>((resolve) => {
  //     setTimeout(() => resolve(data), ms);
  //   });
</script>

<p>Hello {name}</p>

<!-- <Suspense name={delayed(5000, 5000)} component={Async}>
  <p slot="fallback">loading inner...</p>
</Suspense> -->