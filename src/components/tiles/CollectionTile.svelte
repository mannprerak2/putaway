<script>
    import { fade } from "svelte/transition";
    import { onMount, onDestroy, getContext } from "svelte";
    import ItemTile from "./ItemTile.svelte";
    import EmptyItemTile from "./EmptyItemTile.svelte";
    import NoItemTileIndicator from "./NoItemIndicatorTile.svelte";
    import { saveTabHook } from "../../services/hooks.js"
    import { deo } from "./../../stores/stores.js";
    import { searchText } from "../../stores/stores.js";
    import EditCollectionNameModal from "../modals/EditCollectionNameModal.svelte";
    import EditItemModal from "../modals/EditItemModal.svelte";
    const { open } = getContext("simple-modal");

    //font awseome icons
    import Fa from "sveltejs-fontawesome";
    import { faTrashAlt } from "@fortawesome/free-solid-svg-icons/faTrashAlt";
    import { faShareAlt } from "@fortawesome/free-solid-svg-icons/faShareAlt";
    import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
    import { faArchive } from "@fortawesome/free-solid-svg-icons/faArchive";
    //font awesome icons
    let items = [];

    export let collection;
    export let onCollectionDrop;
    export let index;
    export let clickDeleteCollection;
    export let clickShareCollection;
    export let clickArchiveCollection;
    let dropLine = false;
    var onDragEnter = (e) => {
        dropLine = true;
    };
    var onDragLeave = (e) => {
        dropLine = false;
    };

    var handleDragStart = (e) => {
        e.dataTransfer.setData("text", "c" + index.toString());
    };

    var handleDrop = (e) => {
        e.preventDefault();
        dropLine = false;
        onCollectionDrop(e, index);
    };

    onMount(() => {
        chrome.bookmarks.getChildren(collection.id, function (children) {
            // only bookmarks
            items = children.filter((e) => e.url != null);
        });
    });

    const unsubsribe = deo.subscribe((obj) => {
        if (
            obj.source[0] == "i" &&
            obj.target[0] == "i" &&
            (obj.sourceObj.parentId == collection.id ||
                obj.targetObj.id == collection.id)
        ) {
            // target is collection (not item)
            // source is item (not collection)

            var dragIndex = parseInt(obj.source.substring(1));
            var dropIndex = parseInt(obj.target.substring(1));

            // when moving item within the same collection
            if (
                obj.sourceObj.parentId == collection.id &&
                obj.targetObj.id == collection.id
            ) {
                // move items from dragIndex to dropIndex
                if (dragIndex >= dropIndex) {
                    chrome.bookmarks.move(obj.sourceObj.id, {
                        index: dropIndex,
                    });
                    items.splice(dropIndex, 0, obj.sourceObj);
                    items.splice(dragIndex + 1, 1);
                } else {
                    chrome.bookmarks.move(obj.sourceObj.id, {
                        index: dropIndex,
                    });
                    items.splice(dropIndex, 0, obj.sourceObj);
                    items.splice(dragIndex, 1);
                }
            }
            // when moving item to a different collection
            else if (obj.sourceObj.parentId == collection.id) {
                // source is responsible for movement of bookmark
                chrome.bookmarks.move(obj.sourceObj.id, {
                    index: dropIndex,
                    parentId: obj.targetObj.id,
                });

                items.splice(dragIndex, 1);
            } else {
                // obj.targetObj.id == collection.id
                var newObj = JSON.parse(JSON.stringify(obj.sourceObj));
                newObj.parentId = collection.id;

                items.splice(dropIndex, 0, newObj);
            }
            items = items;
        } else if (
            obj.source[0] == "t" &&
            obj.target[0] == "i" &&
            obj.targetObj.id == collection.id
        ) {
            saveTabToBookmark(
                obj.sourceObj,
                parseInt(obj.target.substring(1)),
                !obj.ctrl
            );
        }
    });
    onDestroy(unsubsribe);

    var onItemDelete = (item, i) => {
        items.splice(i, 1);
        items = items;
        chrome.bookmarks.remove(item.id);
    };

    var onClickItem = (item, e) => {
        chrome.tabs.create({
            url: item.url,
            active: !(e.ctrlKey || e.metaKey || e.button==1),
        });
    };

    var onClickItemEdit = async (item, i) => {
        var c = await open(EditItemModal, {
            item: item,
        });
        if (c != null) {
            items[i].title = c;
            items = items;
        }
    };

    var openAllOfCollection = () => {
        items.forEach((i) => {
            chrome.tabs.create({ url: i.url });
        });
    };

    function saveTabToBookmark(tab, dropIndex) {
        saveTabHook(tab)
        chrome.bookmarks.create(
            {
                parentId: collection.id,
                url: tab.url,
                index: dropIndex,
                title: tab.title + ":::::" + tab.favIconUrl,
            },
            function (node) {
                items.splice(dropIndex, 0, node);
                items = items;
            }
        );
    }

    // called when an item drops (child components call this)
    var onDrop = (e, dropIndex) => {
        e.preventDefault();
        var rawData = e.dataTransfer.getData("text");

        var obj = JSON.parse(e.dataTransfer.getData("object"));
        deo.set({
            source: rawData,
            target: "i" + dropIndex.toString(),
            sourceObj: obj,
            targetObj: collection,
            ctrl: e.ctrlKey || e.altKey,
        });
    };

    var openEditCollectionNameModal = async() => {
        var c = await open(EditCollectionNameModal, {
            collection: collection,
        });
        if (c != null) collection.title = c;
    }

    var matchSearch = (item, text) => {
        return item.title.toLowerCase().includes(text.toLowerCase()) || item.url.toLowerCase().includes(text.toLowerCase())
    }

    var hasSearchMatch = true;
    searchText.subscribe(val =>{
        let setTo = true;
        if(val.length>0){
            setTo = false;
            for(let i=0;i<items.length; i++){
                const item = items[i];
                if(matchSearch(item, val)){
                    setTo = true;
                    break;
                }
            }
        }
        hasSearchMatch = setTo;
    });

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

{#if $searchText.length==0 || hasSearchMatch}
<div
    class="collection"
    in:fade={{ duration: 500 }}
    out:fade
    on:dragover|preventDefault>
    {#if dropLine}
        <hr style="border: 1px solid var(--drop-indicator);" />
    {:else}
        <hr style="border: 1px solid var(--bg);" />
    {/if}
    <div
        class="tile-top-bar"
        draggable="true"
        out:fade
        on:dragover|preventDefault={onDragEnter}
        on:dragleave={onDragLeave}
        on:dragstart={handleDragStart}
        on:drop={handleDrop}>
        <div>{collection.title}</div>
        <div style="flex-grow:1;" />
        {#if items.length > 0}
            <div
                id="open-all-tabs"
                class="rounded-button pointer"
                on:click={openAllOfCollection}>
                Open
                {items.length}
                Tabs
            </div>
            &nbsp
        {/if}
        <div
            class="pointer"
            on:click={() => clickShareCollection(index, items)}
            style="font-size: 0.8em; opacity:var(--icon-opacity);">
            <Fa icon={faShareAlt} size="sm" color="var(--icon-color)" />
        </div>
        &nbsp
        <div
            class="pointer"
            on:click={() => clickDeleteCollection(index)}
            style="font-size: 0.8em; opacity:var(--icon-opacity);">
            <Fa icon={faTrashAlt} size="sm" color="var(--icon-color)" />
        </div>
        &nbsp
        <div
            class="pointer"
            on:click={openEditCollectionNameModal}
            style= "font-size: 0.8em; opacity:var(--icon-opacity);"
            alt= "Edit Name">
            <Fa icon={faEdit} size="sm" color="var(--icon-color)" />
        </div>
        &nbsp
        <div
            class="pointer"
            on:click={() => clickArchiveCollection(index)}
            style= "font-size: 0.8em; opacity:var(--icon-opacity);"
            alt= "Archive">
            <Fa icon={faArchive} size="sm" color="var(--icon-color)" />
        </div>
        <!-- <div style="font-size: 0.8em;">⋮</div> -->
    </div>
    <div class="item-area">
            {#if items.length==0}
                <NoItemTileIndicator index={items.length} {onDrop}/>
            {:else}
                {#each items as item,index (item.id)}
                    {#if (matchSearch(item, $searchText)) }
                        <ItemTile {index} {item} {onItemDelete} {onClickItem} {onDrop} {onClickItemEdit}/>
                    {/if}
                {/each}
                <EmptyItemTile index={items.length} {onDrop}/>
            {/if}
        </div>
</div>
{/if}