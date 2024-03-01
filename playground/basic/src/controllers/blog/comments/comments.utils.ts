import {compile} from "path-to-regexp";

type Params = {id: string | number};

export const show = compile<Params>('/comments/:id');
export const edit = compile<Params>('/comments/:id/edit');
export const destroy = compile<Params>('/comments/:id/destroy');