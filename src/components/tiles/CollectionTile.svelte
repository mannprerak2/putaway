<script>
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import ItemTile from './ItemTile.svelte';

    let items = [];

    export let collection;

    onMount(() => {
        chrome.bookmarks.getChildren(collection.id, function (children) {
            // only bookmarks
            items = children.filter((e) => e.url != null);
        });
    });

    var onItemDelete = (item, i) => {
        items.splice(i, 1);
        items = items;
        chrome.bookmarks.remove(item.id);
    }

    var onClickItem = (item,e) => {
        chrome.tabs.create({
            url: item.url,
            active: !e.ctrlKey
        });
    }
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
        /*Item Height Marker*/
        height: 8em;
        /* needs to be 77vw as opentabsbar has 20vw */
        width: 77vw;
        overflow-x: scroll;
        overflow-y: hidden;
        scrollbar-width: 0;
        box-sizing: border-box;
        position: relative;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
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

        {#each items as item,index}
            <ItemTile {index} {item} {onItemDelete} {onClickItem}/>
        {/each}
        <div style="width: 200px; height: 100%; display: inline-block">
        </div>
    </div>
</div>