import {compile} from "path-to-regexp";
export const show = compile('/guide/:id');
export const edit = compile('/guide/:id/edit');
export const destroy = compile('/guide/:id/destroy');