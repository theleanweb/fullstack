<script lang='ts'>
  import {edit, show, destroy} from '../../../controllers/blog/blog.utils';
  export let blog: any;
</script>

<h1>{blog.title}</h1>
<p>{blog.body}</p>

<ul>
  <li>
    <a href="{edit({id: blog.id})}">Edit</a>
  </li>
  
  <li>
    <a href="{destroy({id: blog.id})}">Destroy</a>
  </li>
</ul>