<script>
    import { getContext, onMount } from "svelte";
    const { close } = getContext("simple-modal");
    
    // FontAwesome icons.
    import Fa from "sveltejs-fontawesome";
    import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
    import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
    import { faFolder } from "@fortawesome/free-solid-svg-icons/faFolder";
    import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";

    let collections = $state([]);
    let currentFolderId = $state("");
    let globalSettings = {};

    onMount(() => {
        chrome.storage.sync.get("globalSettings", function (syncRes) {
            globalSettings = syncRes.globalSettings || {};
            if (globalSettings.quickLinksFolderId) {
                currentFolderId = globalSettings.quickLinksFolderId;
            }
        });

        chrome.storage.local.get("pid", function (localRes) {
            if (localRes.pid) {
                chrome.bookmarks.getChildren(localRes.pid, function (children) {
                    collections = children.filter((e) => e.url == null);
                });
            }
        });
    });

    function selectCollection(id) {
        globalSettings.quickLinksFolderId = id;
        chrome.storage.sync.set({ globalSettings }, () => {
            close(id);
        });
    }

    function createNewQuickLinksFolder() {
        chrome.storage.local.get("pid", function (localRes) {
            if (localRes.pid) {
                chrome.bookmarks.create({
                    parentId: localRes.pid,
                    title: "Quick Links",
                    index: 0
                }, function (newFolder) {
                    selectCollection(newFolder.id);
                });
            }
        });
    }
</script>

<main>
    <div class="modal-header">
        <h1>Designate Quick Links</h1>
        <button class="close-modal-btn pointer" onclick={() => close(null)} aria-label="Close modal">
            <Fa icon={faTimes} size="sm" />
        </button>
    </div>

    <p class="modal-description">
        Select a collection to serve as your Quick Links. Bookmarks inside that collection will appear in the top bar.
    </p>

    <div class="collections-list">
        {#each collections as collection}
            <button 
                class="collection-row pointer" 
                class:active={collection.id === currentFolderId}
                onclick={() => selectCollection(collection.id)}
            >
                <div class="collection-info">
                    <span class="folder-icon"><Fa icon={faFolder} size="sm" /></span>
                    <span class="collection-title">{collection.title}</span>
                </div>
                {#if collection.id === currentFolderId}
                    <span class="check-icon"><Fa icon={faCheck} size="sm" /></span>
                {/if}
            </button>
        {/each}
        
        {#if collections.length === 0}
            <div class="empty-state">
                No collections found. Create a collection first or auto-create a Quick Links folder below.
            </div>
        {/if}
    </div>

    <button class="create-folder-btn pointer" onclick={createNewQuickLinksFolder}>
        <span class="plus-icon"><Fa icon={faPlus} size="xs" /></span>
        Create New "Quick Links" Folder
    </button>
</main>

<style>
    main {
        padding: 4px;
        box-sizing: border-box;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    h1 {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0;
        color: var(--txt);
        letter-spacing: -0.01em;
    }

    .close-modal-btn {
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

    .close-modal-btn:hover {
        background-color: var(--outline-btn-hover);
        color: var(--txt);
    }

    .modal-description {
        font-size: 0.85rem;
        color: var(--icon-color);
        margin: 0 0 16px 0;
        line-height: 1.4;
    }

    .collections-list {
        max-height: 240px;
        overflow-y: auto;
        padding-right: 4px;
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .collection-row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        background: var(--tile-bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 8px;
        text-align: left;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }

    .collection-row:hover {
        background-color: var(--card-hover-bg);
        border-color: var(--icon-color);
        transform: translateY(-1px);
    }

    .collection-row.active {
        border-color: var(--accent);
        background: var(--outline-btn-hover);
    }

    .collection-info {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--txt);
    }

    .folder-icon {
        color: var(--icon-color);
        display: flex;
        align-items: center;
    }

    .collection-title {
        font-size: 0.9rem;
        font-weight: 500;
    }

    .check-icon {
        color: var(--accent);
        display: flex;
        align-items: center;
    }

    .empty-state {
        text-align: center;
        padding: 24px;
        font-size: 0.85rem;
        color: var(--icon-color);
        border: 1px dashed var(--outline-btn-border);
        border-radius: 8px;
    }

    .create-folder-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 16px;
        width: 100%;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--accent-txt, white);
        border: none;
        border-radius: 8px;
        background: var(--accent);
        box-shadow: 0 2px 4px var(--accent-glow);
        transition: all 0.2s ease;
    }

    .create-folder-btn:hover {
        background-color: var(--accent-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px var(--accent-glow);
    }

    .plus-icon {
        display: flex;
        align-items: center;
    }
</style>
