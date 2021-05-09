import { writable } from 'svelte/store';

export const searchText = writable("");
export const archiveOnly = writable(false)

// schema of this object
/*
{
    source: dragged element (string, first letter describes type (i, t)
    target: drop zone (string, can be "tab" or "item" or "collection")
    sourceObj: json of source
    targetObj: json of target
}
*/
export const deo = writable({
    source: "null",
    target: "null"
});