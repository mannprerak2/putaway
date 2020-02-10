<script>
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';

    let items = [];

    onMount(() => {

    });

    export let collection;
</script>
<style>
    .collection {
        border-bottom: 1px solid gray;
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
    }

    .tile-top-bar {
        font-size: 2em;
    }

    .item-area {
        height: 8em;
        /* needs to be 77vw as opentabsbar has 20vw */
        width: 77vw;
        overflow-x: scroll;
        overflow-y: hidden;
        scrollbar-width: 0;
        white-space: nowrap;
        box-sizing: border-box;
        position: relative;
    }

    .item-area::-webkit-scrollbar {
        display: none;
    }

    .no-items-indicator {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        left: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        align-content: center;
        justify-content: center;
        color: rgba(10, 10, 10, 0.2);
        font-size: 1em;
    }
</style>
<div class="collection" in:fade="{{duration: 500}}" out:fade>
    <div class="tile-top-bar">{collection.title}</div>
    <div class="item-area">

        {#if items.length==0 }
            <div class="no-items-indicator">
                <h3 >Drag 'n' Drop tabs to add to 'em this collection</h3>
            </div>
        {/if}

        {#each items as item,i}
            <div style="padding-right: 80px; display: inline-block;">
                {item}
            </div>
        {/each}
        <div style="width: 200px; height: 100%;"></div>
    </div>
</div>