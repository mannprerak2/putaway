<script>
    import { fade } from "svelte/transition";
    import { onMount, onDestroy, getContext } from "svelte";
    import ItemTile from "./ItemTile.svelte";
    import EmptyItemTile from "./EmptyItemTile.svelte";
    import NoItemTileIndicator from "./NoItemIndicatorTile.svelte";
    import { saveTabHook, useTabGroupInOpenAllTabs, getOpenTabsBarWidth } from "../../services/hooks.js"
    import { deo } from "./../../stores/stores.js";
    import { searchText } from "../../stores/stores.js";
    import EditCollectionNameModal from "../modals/EditCollectionNameModal.svelte";
    import EditItemModal from "../modals/EditItemModal.svelte";
    import Tooltip from '../common/tooltip/Tooltip.svelte'
    import {setlastNewTabOperationTimeNow} from "../../services/hooks.js";
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
                    setlastNewTabOperationTimeNow();
                    chrome.bookmarks.move(obj.sourceObj.id, {
                        index: dropIndex,
                    });
                    items.splice(dropIndex, 0, obj.sourceObj);
                    items.splice(dragIndex + 1, 1);
                } else {
                    setlastNewTabOperationTimeNow();
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
                setlastNewTabOperationTimeNow();
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
        setlastNewTabOperationTimeNow();
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

    var openAllOfCollection = (collectionName) => {
        let tabOpenType = useTabGroupInOpenAllTabs()
        if (tabOpenType == 'openTabGroup') {
            if (items.length < 1) return
            chrome.tabs.create(
                {url: items[0].url},
                (tab) => {
                    chrome.tabs.group(
                        {tabIds: [tab.id]},
                        (groupId) => {
                            for (var i=1;i<items.length;i++){
                                chrome.tabs.create(
                                    {url: items[i].url},
                                    (tab)=>{
                                        chrome.tabs.group(
                                            {tabIds: [tab.id], groupId: groupId}
                                        )
                                    }
                                )
                            }
                            chrome.tabGroups.update(
                                groupId,
                                {title: collectionName}
                            )
                        }
                    )
                }
            )
        } else if (tabOpenType == 'openTabWindow'){
            chrome.windows.create({}, (window) => {
                items.forEach((i) => {
                    chrome.tabs.create({ url: i.url, windowId: window.id });
                });
            })
        }
        else {
            items.forEach((i) => {
                chrome.tabs.create({ url: i.url });
            });
        }
    };

    function saveTabToBookmark(tab, dropIndex) {
        setlastNewTabOperationTimeNow();
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
        background: var(--tile-bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 12px;
        width: calc(100% - 40px);
        margin: 8px auto;
        padding: 6px 16px 8px 16px;
        box-sizing: border-box;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
        transition: all 0.2s ease;
        position: relative;
    }
    .collection.dragover-collection {
        border-color: var(--drop-indicator);
        box-shadow: 0 0 14px var(--accent-glow);
        transform: translateY(-2px);
    }
    .collection:hover:not(.dragover-collection) {
        border-color: var(--icon-color);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
    }

    .tile-top-bar {
        font-size: 1.1rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        flex-direction: row;
        margin-bottom: 4px;
        color: var(--txt);
        cursor: grab;
        padding: 4px;
        border-radius: 6px;
    }
    .tile-top-bar:active {
        cursor: grabbing;
    }

    .collection-title {
        font-weight: 600;
        letter-spacing: -0.01em;
    }

    .collection-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        color: var(--icon-color);
        background: transparent;
        border: none;
        transition: all 0.2s ease;
    }
    .action-btn:hover {
        background-color: var(--outline-btn-hover);
        color: var(--txt);
        transform: scale(1.08);
    }

    .item-area {
        width: calc(100% + 32px);
        margin-left: -16px;
        margin-right: -16px;
        height: 4.8em;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
        box-sizing: border-box;
        position: relative;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        gap: 12px;
        padding: 4px 16px;
        border-radius: 8px;
        /* Blur/fade-out mask on edges */
        mask-image: linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent);
        -webkit-mask-image: linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent);
    }

    .item-area::-webkit-scrollbar {
        display: none;
    }

    .drop-line-indicator {
        height: 0;
        background: transparent;
        width: 100%;
        margin-bottom: 0;
        border-radius: 2px;
        transition: all 0.2s ease;
    }
    .drop-line-indicator.active {
        height: 3px;
        background: var(--drop-indicator);
        box-shadow: 0 0 8px var(--drop-indicator);
        margin-bottom: 8px;
    }
</style>

{#if $searchText.length==0 || hasSearchMatch}
<div
    class="collection"
    class:dragover-collection={dropLine}
    in:fade={{ duration: 500 }}
    out:fade
    ondragover={(e) => e.preventDefault()}>
    
    <div class="drop-line-indicator" class:active={dropLine}></div>

    <div
        class="tile-top-bar"
        draggable="true"
        out:fade
        ondragover={(e) => e.preventDefault()}
        ondragenter={onDragEnter}
        ondragleave={onDragLeave}
        ondragstart={handleDragStart}
        ondrop={handleDrop}>
        <div class="collection-title">{collection.title}</div>
        <div style="flex-grow:1;" />
        
        <div class="collection-actions">
            {#if items.length > 0}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <button
                    id="open-all-tabs"
                    class="rounded-button pointer"
                    style="padding: 4px 12px; font-size: 0.8rem;"
                    onclick={(e)=>openAllOfCollection(collection.title)}>
                    Open {items.length} Tabs
                </button>
            {/if}

            <Tooltip title="Share Collection" ypos="-32">
                <button
                    class="action-btn pointer"
                    onclick={(e) => clickShareCollection(index, items)}>
                    <Fa icon={faShareAlt} size="sm" color="var(--icon-color)" />
                </button>
            </Tooltip>
            
            <Tooltip title="Delete Collection" ypos="-32">
                <button
                    class="action-btn pointer"
                    onclick={(e) => clickDeleteCollection(index)}>
                    <Fa icon={faTrashAlt} size="sm" color="var(--icon-color)" />
                </button>
            </Tooltip>
            
            <Tooltip title="Edit Name" ypos="-32">
                <button
                    class="action-btn pointer"
                    onclick={openEditCollectionNameModal}>
                    <Fa icon={faEdit} size="sm" color="var(--icon-color)" />
                </button>
            </Tooltip>
            
            <Tooltip title="Archive" ypos="-32">
                <button
                    class="action-btn pointer"
                    onclick={(e) => clickArchiveCollection(index)}>
                    <Fa icon={faArchive} size="sm" color="var(--icon-color)" />
                </button>
            </Tooltip>
        </div>
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