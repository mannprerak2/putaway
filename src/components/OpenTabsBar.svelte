<script>
    import { onMount, onDestroy, getContext } from "svelte";
    import TabTile from "./tiles/TabTile.svelte";
    import EmptyTabTile from "./tiles/EmptyTabTile.svelte";
    import { deo } from "./../stores/stores.js";
    import {setlastNewTabOperationTimeNow} from '../services/hooks.js';
    const { open } = getContext("simple-modal");
    import SaveSessionModal from "./modals/SaveSessionModal.svelte";

    let allTabs = [];

    onMount(() => {
        chrome.tabs.query(
            {
                currentWindow: true,
            },
            (tabs) => {
                allTabs = tabs.filter(function (tab) {
                    return tab.url != "chrome://newtab/";
                });
            }
        );
    });

    const unsubsribe = deo.subscribe((obj) => {
        if (obj.source[0] == "t") {
            if (obj.target[0] == "i") {
                if (obj.ctrl != null && !obj.ctrl) {
                    //  only delete tab if ctrl wasn't held by user
                    setlastNewTabOperationTimeNow();
                    chrome.tabs.remove(obj.sourceObj.id);
                    allTabs.splice(parseInt(obj.source.substring(1)), 1);
                    allTabs = allTabs;
                }
            } else if (obj.target[0] == "t") {
                var dragIndex = parseInt(obj.source.substring(1));
                var dropIndex = parseInt(obj.target.substring(1));
                // move tabs from dragIndex to dropIndex
                if (dragIndex >= dropIndex) {
                    setlastNewTabOperationTimeNow();
                    chrome.tabs.move(obj.sourceObj.id, { index: dropIndex });
                    allTabs.splice(dropIndex, 0, obj.sourceObj);
                    allTabs.splice(dragIndex + 1, 1);
                } else {
                    setlastNewTabOperationTimeNow();
                    chrome.tabs.move(obj.sourceObj.id, {
                        index: dropIndex - 1,
                    });
                    allTabs.splice(dropIndex, 0, obj.sourceObj);
                    allTabs.splice(dragIndex, 1);
                }
                allTabs = allTabs;
            }
        }
    });
    onDestroy(unsubsribe);

    var onClickTabCard = (tab) => {
        chrome.tabs.update(tab.id, { active: true });
    };

    var onTabTileClose = (tab, i) => {
        allTabs.splice(i, 1);
        allTabs = allTabs;
        setlastNewTabOperationTimeNow();
        chrome.tabs.remove(tab.id);
    };

    var onDrop = (e, dropIndex) => {
        e.preventDefault();
        var rawData = e.dataTransfer.getData("text");
        var obj = JSON.parse(e.dataTransfer.getData("object"));
        deo.set({
            source: rawData,
            target: "t" + dropIndex.toString(),
            sourceObj: obj,
            targetObj: allTabs[dropIndex],
        });
    };

    var saveSession = async () => {
        var c = await open(SaveSessionModal);
        if (c) {
            var count = allTabs.length;
            setlastNewTabOperationTimeNow();
            allTabs.forEach((tab) => {
                chrome.bookmarks.create(
                    {
                        parentId: c.id,
                        url: tab.url,
                        title: tab.title + ":::::" + tab.favIconUrl,
                    },
                    function (node) {
                        count--;
                        if (count == 0) {
                            // reload tab to take effect
                            chrome.tabs.query(
                                { active: true, currentWindow: true },
                                function (tabs) {
                                    chrome.tabs.reload(tabs[0].id);
                                }
                            );
                        }
                    }
                );
            });
        }
    };
</script>

<style>
    .sidebar-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--collection-separator);
    }
    .title-area {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
        color: var(--txt);
    }
    .badge {
        background-color: var(--outline-btn-hover);
        color: var(--txt);
        font-size: 0.75rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid var(--outline-btn-border);
    }
    .scroll-container {
        height: calc(100vh - 96px);
        overflow-y: auto;
        padding-right: 4px;
    }
</style>

<div>
    <div class="sidebar-header">
        <div class="title-area">
            <h2 class="title">Open Tabs</h2>
            <span class="badge">{allTabs.length}</span>
        </div>
        <div style="flex-grow: 1;" />
        {#if allTabs.length > 0}
            <button
                class="rounded-button pointer"
                style="padding: 4px 12px; font-size: 0.8rem;"
                onclick={saveSession}>
                Save Session
            </button>
        {/if}
    </div>

    <div class="scroll scroll-container">
        {#each allTabs as tab, i (tab.id)}
            <TabTile
                {tab}
                index={i}
                {onClickTabCard}
                {onTabTileClose}
                {onDrop} />
        {/each}
        <EmptyTabTile index={allTabs.length} {onDrop} />
    </div>
</div>
