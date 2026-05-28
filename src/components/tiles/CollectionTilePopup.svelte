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
        padding: 0 12px;
        box-sizing: border-box;
        font-size: 0.9rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
        border-radius: 6px;
        transition: all 0.2s ease;
        margin-bottom: 4px;
    }

    .popup-collection-tile:hover {
        background-color: var(--outline-btn-hover);
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
