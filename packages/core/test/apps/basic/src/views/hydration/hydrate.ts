import Counter from "./counter.svelte";
import { Html } from "@leanweb/fullstack/runtime";

const props = (Html.get_script_json("counter") ?? {}) as any;

new Counter({
  props,
  hydrate: true,
  target: document.querySelector(".counter")!,
});
