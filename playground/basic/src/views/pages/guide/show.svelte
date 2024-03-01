<script lang='ts'>
  import {edit, show, destroy} from '../../../controllers/guide/guide.utils';
  export let guide: any;
</script>

<h1>{guide.title}</h1>
<p>{guide.body}</p>

<ul>
  <li>
    <a href="{edit({id: guide.id})}">Edit</a>
  </li>
  
  <li>
    <a href="{destroy({id: guide.id})}">Destroy</a>
  </li>
</ul>