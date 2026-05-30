<script>
    import { fade } from "svelte/transition";
    import { onMount, onDestroy, getContext } from "svelte";
    import ItemTile from "./ItemTile.svelte";
    import EmptyItemTile from "./EmptyItemTile.svelte";
    import NoItemTileIndicator from "./NoItemIndicatorTile.svelte";
    import { saveTabHook, useTabGroupInOpenAllTabs, getOpenTabsBarWidth } from "../../services/hooks.js"
    import { deo, dragActive, dragType } from "./../../stores/stores.js";
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
    import { faEllipsisV } from "@fortawesome/free-solid-svg-icons/faEllipsisV";
    //font awesome icons
    let items = [];
    let showMenu = false;

    function toggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        showMenu = !showMenu;
    }

    function closeMenu() {
        showMenu = false;
    }

    export let collection;
    export let onCollectionDrop;
    export let index;
    export let clickDeleteCollection;
    export let clickShareCollection;
    export let clickArchiveCollection;

    let dropLine = false;
    let dragging = false;
    let dragCounter = 0;

    var onDragEnter = (e) => {
        dragCounter++;
        if (dragCounter === 1) {
            dropLine = true;
        }
    };
    var onDragLeave = (e) => {
        dragCounter--;
        if (dragCounter === 0) {
            dropLine = false;
        }
    };

    var handleDragStart = (e) => {
        dragging = true;
        dragActive.set(true);
        dragType.set("collection");
        e.dataTransfer.setData("text", "c" + index.toString());
    };

    var handleDragEnd = (e) => {
        dragging = false;
        dragActive.set(false);
        dragType.set("");
        dragCounter = 0;
        dropLine = false;
    };

    var handleDrop = (e) => {
        e.preventDefault();
        dragCounter = 0;
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
        } else if (
            obj.source[0] == "i" &&
            obj.target == "delete" &&
            obj.sourceObj.parentId == collection.id
        ) {
            var dragIndex = parseInt(obj.source.substring(1));
            setlastNewTabOperationTimeNow();
            chrome.bookmarks.remove(obj.sourceObj.id);
            items.splice(dragIndex, 1);
            items = items;
        }
    });

    let localDragType = "";
    const unsubscribeDragType = dragType.subscribe((val) => {
        localDragType = val;
    });

    const unsubscribeDrag = dragActive.subscribe((active) => {
        if (!active) {
            dragCounter = 0;
            dropLine = false;
        }
    });

    onDestroy(() => {
        unsubsribe();
        unsubscribeDrag();
        unsubscribeDragType();
    });

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
    .collection.menu-open {
        z-index: 10;
    }
    .collection.dragover-collection {
        border-color: var(--drop-indicator);
        box-shadow: 0 0 14px var(--accent-glow);
        transform: translateY(-2px);
    }
    .collection.dragging {
        opacity: 0.35;
        border-style: dashed;
        transform: scale(0.98);
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
        position: relative;
    }

    .ellipsis-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        color: var(--icon-color);
        background: transparent;
        border: none;
        transition: all 0.15s ease;
        cursor: pointer;
        padding: 0;
    }
    .ellipsis-btn:hover {
        color: var(--txt);
        transform: scale(1.15);
    }

    .collection-actions.menu-active .ellipsis-btn {
        color: var(--txt);
    }

    .context-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 4px;
        background: var(--bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 6px;
        box-shadow: 0 4px 12px var(--box-shadow);
        z-index: 100;
        display: flex;
        flex-direction: column;
        padding: 4px;
        min-width: 110px;
    }

    .context-menu-item {
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--txt);
        padding: 6px 10px;
        text-align: left;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        box-sizing: border-box;
    }

    .context-menu-item:hover {
        background: var(--card-hover-bg);
    }

    .context-menu-item.delete:hover {
        background: var(--danger);
        color: #ffffff;
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
        position: absolute;
        top: -2px;
        left: 16px;
        right: 16px;
        height: 4px;
        background: transparent;
        border-radius: 2px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 5;
    }
    .drop-line-indicator.active {
        background: var(--drop-indicator);
        box-shadow: 0 0 10px var(--drop-indicator);
    }
    .collection.drag-active:not(.dragging) * {
        pointer-events: none;
    }
</style>

<svelte:window onclick={closeMenu} />

{#if $searchText.length==0 || hasSearchMatch}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="collection"
    class:dragover-collection={dropLine && localDragType === "collection"}
    class:dragging={dragging}
    class:menu-open={showMenu}
    class:drag-active={$dragActive && localDragType === "collection"}
    in:fade={{ duration: 500 }}
    out:fade
    ondragover={(e) => {
        if (localDragType === "collection") {
            e.preventDefault();
        }
    }}
    ondragenter={(e) => {
        if (localDragType === "collection") {
            onDragEnter(e);
        }
    }}
    ondragleave={(e) => {
        if (localDragType === "collection") {
            onDragLeave(e);
        }
    }}
    ondrop={(e) => {
        if (localDragType === "collection") {
            handleDrop(e);
        }
    }}>
    
    <div class="drop-line-indicator" class:active={dropLine && localDragType === "collection"}></div>

    <div
        class="tile-top-bar"
        draggable="true"
        out:fade
        ondragstart={handleDragStart}
        ondragend={handleDragEnd}>
        <div class="collection-title">{collection.title}</div>
        <div style="flex-grow:1;" />
        
        <div class="collection-actions" class:menu-active={showMenu}>
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

            <Tooltip title="Actions" ypos="-32">
                <button
                    class="ellipsis-btn pointer"
                    onclick={toggleMenu}>
                    <Fa icon={faEllipsisV} size="sm" color="currentColor" />
                </button>
            </Tooltip>

            {#if showMenu}
                <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                <div class="context-menu" onclick={(e) => e.stopPropagation()}>
                    <button
                        class="context-menu-item pointer"
                        onclick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            showMenu = false;
                            clickShareCollection(index, items);
                        }}>
                        <Fa icon={faShareAlt} size="xs" color="currentColor" />
                        <span>Share</span>
                    </button>
                    <button
                        class="context-menu-item pointer"
                        onclick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            showMenu = false;
                            openEditCollectionNameModal();
                        }}>
                        <Fa icon={faEdit} size="xs" color="currentColor" />
                        <span>Edit Name</span>
                    </button>
                    <button
                        class="context-menu-item pointer"
                        onclick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            showMenu = false;
                            clickArchiveCollection(index);
                        }}>
                        <Fa icon={faArchive} size="xs" color="currentColor" />
                        <span>Archive</span>
                    </button>
                    <button
                        class="context-menu-item delete pointer"
                        onclick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            showMenu = false;
                            clickDeleteCollection(index);
                        }}>
                        <Fa icon={faTrashAlt} size="xs" color="currentColor" />
                        <span>Delete</span>
                    </button>
                </div>
            {/if}
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