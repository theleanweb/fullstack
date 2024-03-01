<script lang='ts'>
  import {edit, show, destroy} from '../../../../controllers/blog/comments/comments.utils';
  export let comments: any;
</script>

<h1>{comments.title}</h1>
<p>{comments.body}</p>

<ul>
  <li>
    <a href="{edit({id: comments.id})}">Edit</a>
  </li>
  
  <li>
    <a href="{destroy({id: comments.id})}">Destroy</a>
  </li>
</ul>