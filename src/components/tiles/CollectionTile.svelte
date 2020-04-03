<script>
    import { fade, fly } from 'svelte/transition';
    import { onMount, onDestroy, getContext } from 'svelte';
    import ItemTile from './ItemTile.svelte';
    import EmptyItemTile from './EmptyItemTile.svelte';
    import NoItemTileIndicator from './NoItemIndicatorTile.svelte';
    import { deo } from './../../stores/dropEventStore.js';
    import { searchText } from './../../stores/searchTextStore.js'
    import PopupMenu from './../PopupMenu.svelte';
    import EditCollectionNameModal from './../modals/EditCollectionNameModal.svelte';
    const { open } = getContext('simple-modal');

    let items = [];

    export let collection;
    export let onCollectionDrop;
    export let index;
    export let clickDeleteCollection;
    let dropLine = false;
    var onDragEnter = (e) => {
        dropLine = true;
    }
    var onDragLeave = (e) => {
        dropLine = false;
    }

    var handleDragStart = (e) => {
        e.dataTransfer
            .setData("text", "c" + index.toString());
    }

    var handleDrop = (e) => {
        e.preventDefault();
        dropLine = false;
        onCollectionDrop(e, index);
    }

    onMount(() => {
        chrome.bookmarks.getChildren(collection.id, function (children) {
            // only bookmarks
            items = children.filter((e) => e.url != null);
        });
    });

    const unsubsribe = deo.subscribe(obj => {
        if (obj.source[0] == "i" &&
            obj.target[0] == "i" &&
            (obj.sourceObj.parentId == collection.id ||
                obj.targetObj.id == collection.id)) {

            // target is collection (not item)
            // source is item (not collection)

            var dragIndex = parseInt(obj.source.substr(1));
            var dropIndex = parseInt(obj.target.substr(1));

            // when moving item within the same collection
            if (obj.sourceObj.parentId == collection.id && obj.targetObj.id == collection.id) {
                // move items from dragIndex to dropIndex
                if (dragIndex >= dropIndex) {
                    chrome.bookmarks.move(obj.sourceObj.id, { index: dropIndex });
                    items.splice(dropIndex, 0, obj.sourceObj);
                    items.splice(dragIndex + 1, 1);
                }
                else {
                    chrome.bookmarks.move(obj.sourceObj.id, { index: dropIndex });
                    items.splice(dropIndex, 0, obj.sourceObj);
                    items.splice(dragIndex, 1);
                }
            }
            // when moving item to a different collection
            else if (obj.sourceObj.parentId == collection.id) {
                // source is responsible for movement of bookmark
                chrome.bookmarks.move(obj.sourceObj.id, { index: dropIndex, parentId: obj.targetObj.id });

                items.splice(dragIndex, 1);
            } else {// obj.targetObj.id == collection.id
                var newObj = JSON.parse(JSON.stringify(obj.sourceObj));
                newObj.parentId = collection.id;

                items.splice(dropIndex, 0, newObj);
            }
            items = items;
        } else if (obj.source[0] == "t" &&
            obj.target[0] == "i" && obj.targetObj.id == collection.id) {
            saveTabToBookmark(obj.sourceObj, parseInt(obj.target.substr(1)), !obj.ctrl);
        }
    });
    onDestroy(unsubsribe);

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

    var openAllOfCollection = () => {
        items.forEach((i) => {
            chrome.tabs.create({ url: i.url });
        });
    }

    function saveTabToBookmark(tab, dropIndex) {
        chrome.bookmarks.create(
            {
                parentId: collection.id,
                url: tab.url,
                index: dropIndex,
                title: tab.title + ":::::" + tab.favIconUrl
            }, function (node) {
                items.splice(dropIndex, 0, node);
                items = items;
            }
        );
    }

    // called when an item drops (child components call this)
    var onDrop = (e, dropIndex) => {
        e.preventDefault();
        var rawData = e.dataTransfer.getData('text');

        var obj = JSON.parse(e.dataTransfer.getData("object"));
        deo.set({
            source: rawData,
            target: "i" + dropIndex.toString(),
            sourceObj: obj,
            targetObj: collection,
            ctrl: e.ctrlKey
        });
    }

    var popupItems = ["🖉 Edit Name"];
    var onClickPopupItem = async (item, index) => {
        switch (index) {
            case 0: // edit name
                var c = await open(EditCollectionNameModal, { collection: collection });
                collection.title = c;
                break;
            default:
                break;
        }
    }
</script>
<style>
    .collection {
        border-bottom: 1px solid var(--collection-separator);
        width: 100%;
        padding: 10px;
        padding-top: 0px;
        box-sizing: border-box;
    }

    .tile-top-bar {
        font-size: 2em;
        display: flex;
        align-items: center;
        flex-direction: row;
    }

    .item-area {
        /*Item Height Marker*/
        height: 5em;
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
</style>
<div class="collection" in:fade="{{duration: 500}}" out:fade on:dragover|preventDefault>
    {#if dropLine}
            <hr style="border: 1px solid var(--drop-indicator);">
        {:else}
            <hr style="border: 1px solid var(--bg);">
        {/if}
        <div class="tile-top-bar" draggable="true" out:fade on:dragover|preventDefault={onDragEnter}
            on:dragleave={onDragLeave} on:dragstart={handleDragStart} on:drop={handleDrop}>
            <div>{collection.title}</div>
            <div style="flex-grow:1;"/>
            {#if items.length>0}
            <div id="open-all-tabs" class="rounded-button pointer" on:click={openAllOfCollection}>Open {items.length} Tabs</div>
            &nbsp
            {/if}
            <div class="pointer" on:click={()=>clickDeleteCollection(index)} style="font-size: 0.8em;">🗑️</div>
            &nbsp
            <PopupMenu items={popupItems} onClickItem={onClickPopupItem} />
            <!-- <div style="font-size: 0.8em;">⋮</div> -->
        </div>
        <div class="item-area">
            {#if items.length==0}
                <NoItemTileIndicator index={items.length} {onDrop}/>
            {:else}
                {#each items as item,index (item.id)}
                    {#if (item.title.toLowerCase().includes($searchText.toLowerCase()) || item.url.toLowerCase().includes($searchText.toLowerCase())) }
                        <ItemTile {index} {item} {onItemDelete} {onClickItem} {onDrop}/>
                    {/if}
                {/each}
                <EmptyItemTile index={items.length} {onDrop}/>
            {/if}
        </div>
</div>