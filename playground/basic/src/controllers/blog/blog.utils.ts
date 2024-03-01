import {compile} from "path-to-regexp";
export const show = compile('blog/:id');
export const edit = compile('blog/:id/edit');
export const destroy = compile('blog/:id/destroy');