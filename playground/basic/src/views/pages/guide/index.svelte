<script lang='ts'>
  import {edit, show, destroy} from '../../../controllers/guide/guide.utils';
  export let guide: any[];
</script>

<ul>
  {#each guide as item}
  <li>
    <a href="{show({id: item.id})}">{item.title}</a>
  </li>
  {/each}
</ul>