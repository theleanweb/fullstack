<script lang='ts'>
  import {edit, show, destroy} from '../../../controllers/blog/blog.utils';
  export let blog: any[];
</script>

<ul>
  {#each blog as item}
  <li>
    <a href="{show({id: item.id})}">{item.title}</a>
  </li>
  {/each}
</ul>