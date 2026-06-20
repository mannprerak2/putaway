<script context="module">
    let persistedSelectedWindowId = null;
</script>

<script>
    import { onMount, onDestroy, getContext } from "svelte";
    import { fade } from "svelte/transition";
    import TabTile from "./tiles/TabTile.svelte";
    import EmptyTabTile from "./tiles/EmptyTabTile.svelte";
    import { deo, dragActive, dragType } from "./../stores/stores.js";
    import {setlastNewTabOperationTimeNow} from '../services/hooks.js';
    const { open } = getContext("simple-modal");
    import SaveSessionModal from "./modals/SaveSessionModal.svelte";

    let allTabs = [];
    let windows = [];
    let currentWindowId = null;

    const loadWindowsAndTabs = () => {
        chrome.windows.getCurrent({ populate: false }, (currentWin) => {
            currentWindowId = currentWin.id;
            if (persistedSelectedWindowId === null) {
                persistedSelectedWindowId = currentWin.id;
            }

            chrome.windows.getAll({ populate: true }, (allWindows) => {
                // Filter to normal browser windows
                windows = allWindows.filter(w => w.type === 'normal');

                // Check if selected window is still open, otherwise fallback to current
                const selectedWinExists = windows.some(w => w.id === persistedSelectedWindowId);
                if (!selectedWinExists) {
                    persistedSelectedWindowId = currentWin.id;
                }

                const selectedWin = windows.find(w => w.id === persistedSelectedWindowId);
                if (selectedWin) {
                    allTabs = selectedWin.tabs.filter(tab => tab.url !== "chrome://newtab/");
                } else {
                    allTabs = [];
                }
            });
        });
    };

    onMount(() => {
        loadWindowsAndTabs();
    });

    const unsubsribe = deo.subscribe((obj) => {
        if (obj.source[0] == "t") {
            if (obj.target[0] == "i") {
                if (obj.ctrl) {
                    //  only delete tab if ctrl/alt was held by user
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
            } else if (obj.target == "delete") {
                var dragIndex = parseInt(obj.source.substring(1));
                setlastNewTabOperationTimeNow();
                chrome.tabs.remove(obj.sourceObj.id);
                allTabs.splice(dragIndex, 1);
                allTabs = allTabs;
            }
        }
    });
    onDestroy(unsubsribe);

    var onClickTabCard = (tab) => {
        chrome.tabs.update(tab.id, { active: true });
        if (tab.windowId !== currentWindowId) {
            chrome.windows.update(tab.windowId, { focused: true });
        }
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

    var selectWindow = (windowId) => {
        persistedSelectedWindowId = windowId;
        loadWindowsAndTabs();
    };

    var switchWindow = (windowId) => {
        chrome.windows.update(windowId, { focused: true });
    };

    const getActiveTab = (win) => {
        if (!win.tabs) return null;
        return win.tabs.find(t => t.active);
    };

    const getWindowName = (win, index) => {
        const activeTab = getActiveTab(win);
        if (activeTab && activeTab.title) {
            return activeTab.title;
        }
        return `Window ${index + 1}`;
    };
</script>

<style>
    .sidebar-header {
        display: flex;
        align-items: center;
        padding-bottom: 8px;
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
    .sidebar-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
    }
    .scroll-container {
        height: calc(100vh - 96px);
        overflow-y: auto;
        padding-right: 4px;
    }
    .drag-hint {
        position: absolute;
        bottom: 16px;
        left: 8px;
        right: 8px;
        font-size: 0.8rem;
        color: var(--txt);
        background: var(--bg);
        border: 1px dashed var(--outline-btn-border);
        padding: 8px 12px;
        border-radius: 8px;
        text-align: center;
        line-height: 1.3;
        box-shadow: 0 4px 12px var(--box-shadow);
        z-index: 1000;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

    /* Window Selector Styling */
    .window-section {
        margin-top: 4px;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--collection-separator);
    }
    .window-section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
    }
    .window-section-title {
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--icon-color);
    }
    .window-list-scroll {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 6px;
        scrollbar-width: thin;
        scrollbar-color: var(--outline-btn-border) transparent;
    }
    .window-list-scroll::-webkit-scrollbar {
        height: 4px;
    }
    .window-list-scroll::-webkit-scrollbar-track {
        background: transparent;
    }
    .window-list-scroll::-webkit-scrollbar-thumb {
        background-color: var(--outline-btn-border);
        border-radius: 2px;
    }
    .window-card {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--outline-btn-border);
        background: var(--tile-bg);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 140px;
        max-width: 200px;
        outline: none;
    }
    .window-card:hover {
        background: var(--card-hover-bg);
        border-color: var(--icon-color);
    }
    .window-card.active {
        border-color: var(--accent);
        background: var(--accent-glow, rgba(15, 23, 42, 0.05));
        box-shadow: 0 0 0 1px var(--accent);
    }
    .window-favicon {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        flex-shrink: 0;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
    }
    .window-icon {
        color: var(--icon-color);
        flex-shrink: 0;
    }
    .window-card-info {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-width: 0;
        text-align: left;
    }
    .window-card-title {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--txt);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }
    .window-card-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 2px;
        flex-wrap: wrap;
    }
    .window-card-tabs-count {
        font-size: 0.7rem;
        color: var(--icon-color);
    }
    .current-tag {
        font-size: 0.6rem;
        background: var(--accent);
        color: var(--accent-txt);
        padding: 0px 4px;
        border-radius: 4px;
        font-weight: 500;
        line-height: 1.2;
    }
    .window-switch-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1px solid var(--outline-btn-border);
        color: var(--icon-color);
        background: transparent;
        transition: all 0.2s ease;
        padding: 0;
        cursor: pointer;
        flex-shrink: 0;
    }
    .window-switch-btn:hover {
        background: var(--accent);
        color: var(--accent-txt);
        border-color: var(--accent);
    }
</style>

<div class="sidebar-container">
    {#if windows.length > 1}
        <div class="window-section">
            <div class="window-section-header">
                <span class="window-section-title">Open Windows</span>
                <span class="badge">{windows.length}</span>
            </div>
            <div class="window-list-scroll">
                {#each windows as win, index (win.id)}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="window-card"
                        class:active={persistedSelectedWindowId === win.id}
                        class:current={currentWindowId === win.id}
                        onclick={() => selectWindow(win.id)}
                        role="button"
                        tabindex="0"
                    >
                        {#if getActiveTab(win)?.favIconUrl}
                            <img
                                src={getActiveTab(win).favIconUrl}
                                alt=""
                                class="window-favicon"
                            />
                        {:else}
                            <svg class="window-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                        {/if}

                        <div class="window-card-info">
                            <div class="window-card-title" title={getWindowName(win, index)}>
                                {getWindowName(win, index)}
                            </div>
                            <div class="window-card-meta">
                                <span class="window-card-tabs-count">{win.tabs ? win.tabs.length : 0} tabs</span>
                                {#if currentWindowId === win.id}
                                    <span class="current-tag">Current</span>
                                {/if}
                            </div>
                        </div>
                        <button
                            class="window-switch-btn pointer"
                            title="Switch to this window"
                            onclick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                switchWindow(win.id);
                            }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 3h6v6"></path>
                                <path d="M10 14 21 3"></path>
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            </svg>
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

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

    <div class="scroll scroll-container" style={windows.length > 1 ? 'height: calc(100vh - 180px);' : ''}>
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

    {#if $dragActive && $dragType === "tab"}
        <div class="drag-hint" transition:fade>
            💡 Hold <strong>Ctrl</strong> or <strong>Alt</strong> while dropping to close the tab.
        </div>
    {/if}
</div>
