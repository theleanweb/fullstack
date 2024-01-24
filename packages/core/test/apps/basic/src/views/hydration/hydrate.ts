import Page from "./page.svelte";
import { Html } from "@leanweb/fullstack/runtime";

const props = Html.get_script_json("counter") ?? {};

console.log(props);

new Page({ props, hydrate: true, target: document.documentElement });
