<script>
    import { saveTabHook } from "../../services/hooks.js";
    export let collection;
    export let tab;
    export let alreadySaved;

    let savedInThis = false;
    if (alreadySaved) {
        savedInThis = alreadySaved;
    }

    // will contain a bookmark if one was created rn
    let bm;
    var click = () => {
        savedInThis = !savedInThis;

        if (savedInThis) {
            saveTabToBookmark(tab);
        } else {
            if (bm) {
                chrome.bookmarks.remove(bm.id);
            } else {
                // remove all bookmarks in this with url of this tab
                chrome.bookmarks.search({ url: tab.url }, function (bms) {
                    bms.forEach((b) => {
                        chrome.bookmarks.remove(b.id);
                    });
                });
            }
        }
    };

    function saveTabToBookmark(tab) {
        saveTabHook(tab)
        chrome.bookmarks.create(
            {
                parentId: collection.id,
                url: tab.url,
                title: tab.title + ":::::" + tab.favIconUrl,
            },
            function (node) {
                bm = node;
            }
        );
    }
</script>

<style>
    .popup-collection-tile {
        height: 42px;
        width: 100%;
        color: var(--txt);
        background: var(--tile-bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 8px;
        padding: 0 14px;
        box-sizing: border-box;
        font-size: 0.9rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        margin-bottom: 8px;
    }

    .popup-collection-tile:hover {
        background-color: var(--card-hover-bg);
        border-color: var(--icon-color);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px var(--box-shadow);
    }

    .collection-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-grow: 1;
    }

    .save-indicator {
        color: var(--accent);
        font-weight: bold;
        font-size: 1rem;
        margin-left: 8px;
    }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
    class="popup-collection-tile pointer"
    title={collection.title}
    onclick={click}>
    <span class="collection-name">{collection.title}</span>
    {#if savedInThis}
        <span class="save-indicator">✓</span>
    {/if}
</div>
