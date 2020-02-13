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

    var onClickItem = (item, e) => {
        chrome.tabs.create({
            url: item.url,
            active: !e.ctrlKey
        });
    }

    var onDrop = (e, dropIndex) => {
        e.preventDefault();
        var rawData = e.dataTransfer.getData('text');

        // first letter is t if a tab is dropped
        if (rawData[0] == "t") {

        } else if (rawData[0] == "i") {
            // first letter is i if an item was dropped here
            var dragIndex = parseInt(rawData.substr(1));
            // move items from dragIndex to dropIndex
            if (dragIndex >= dropIndex) {
                chrome.bookmarks.move(items[dragIndex].id, { index: dropIndex });
                items.splice(dropIndex, 0, items[dragIndex]);
                items.splice(dragIndex + 1, 1);
            }
            else {
                chrome.bookmarks.move(items[dragIndex].id, { index: dropIndex - 1 });
                items.splice(dropIndex, 0, items[dragIndex]);
                items.splice(dragIndex, 1);
            }

            items = items;
        }
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
<div class="collection" in:fade="{{duration: 500}}" out:fade on:dragover|preventDefault>
    <div class="tile-top-bar">{collection.title}</div>
    <div class="item-area">

        {#if items.length==0 }
            <div class="no-items-indicator">
                <h3 >Drag 'n' Drop tabs to add to 'em this collection</h3>
            </div>
        {/if}

        {#each items as item,index}
            <ItemTile {index} {item} {onItemDelete} {onClickItem} {onDrop}/>
        {/each}
        <div style="width: 200px; height: 100%; display: inline-block">
        </div>
    </div>
</div>