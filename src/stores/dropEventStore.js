import { writable } from 'svelte/store';

export const dropEventObject = writable();
// schema of this object
/* 
{
    source: dragged element (string, can be "tab" or "item" or "collection")
    target: drop zone (string, can be "tab" or "item" or "collection")
    
}
*/