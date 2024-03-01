<script lang='ts'>
  import {edit, show, destroy} from '../../../../controllers/blog/comments/comments.utils';
  export let comments: any[];
</script>

<ul>
  {#each comments as item}
  <li>
    <a href="{show({id: item.id})}">{item.title}</a>
  </li>
  {/each}
</ul>