<script lang="ts">
  import Suspense from "../../suspense/suspense.svelte";

  import Async from "./async.svelte";

  const delayed = <T,>(ms: number, data: T) =>
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(data), ms);
    });
</script>

<h1>Suspense</h1>

<Suspense name={delayed(10000, 2000)} component={Async}>
  <p slot="fallback">loading...</p>

  <Suspense name={delayed(10000, 3000)} component={Async}>
    <p slot="fallback">loading...</p>

    <Suspense name={delayed(10000, 3000)} component={Async}>
      <p slot="fallback">loading...</p>
    </Suspense>
  </Suspense>
</Suspense>
