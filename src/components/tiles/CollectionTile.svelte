<script>
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';

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

    .item {
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
        border-radius: 5px;
        width: 15em;
        /* do not use margin top/bottom, it will overflow */
        height: 95%;
        margin-right: 10px;
        padding: 10px;
        display: inline-block;
        box-sizing: border-box;
        position: relative;
    }

    .close-icon {
        display: none;
    }

    .item:hover .close-icon {
        position: absolute;
        right: -16px;
        margin-right: 10px;
        bottom: 0;
        display: block;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border-width: 3px;
        border-style: solid;
        border-color: gray;
        border-radius: 100%;
        background: -webkit-linear-gradient(-45deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%), -webkit-linear-gradient(45deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%);
        background-color: gray;
    }

    .close-icon:hover {
        cursor: pointer;
    }

    .text-concat {
        position: relative;
        display: inline-block;
        word-wrap: break-word;
        overflow: hidden;
        max-height: 2em;
        line-height: 1em;
        font-size: 1.2em;
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
            <div class="item" draggable="true" out:fade on:click|preventDefault={(e)=> onClickItem(item,e)}>
                <button class="close-icon" on:click|preventDefault|stopPropagation={()=> onItemDelete(item,i)}></button>
                
                <div class="flex-row-container">
                    <img alt=' ' src={item.url} height="20px" style="margin-right: 10px;"/>
                    
                    <div class="text-concat">
                        {item.title}
                    </div>
                </div>
            </div>
        {/each}
        <div style="width: 200px; height: 100%; display: inline-block">
        </div>
    </div>
</div>