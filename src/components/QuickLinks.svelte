<script>
    import Tooltip from './common/tooltip/Tooltip.svelte'
    import { onMount, onDestroy, getContext } from "svelte";
    import { fade } from "svelte/transition";
    const { open } = getContext("simple-modal");
    import SelectQuickLinksCollectionModal from "./modals/SelectQuickLinksCollectionModal.svelte";

    // FontAwesome icons.
    import Fa from "sveltejs-fontawesome";
    import { faPenAlt } from "@fortawesome/free-solid-svg-icons/faPenAlt";
    import { faGlobe } from "@fortawesome/free-solid-svg-icons/faGlobe";

    let quickLinks = $state([]);
    let quickLinksFolderId = $state("");

    function loadQuickLinks() {
        chrome.storage.sync.get("globalSettings", function (res) {
            let globalSettings = res.globalSettings || {};
            quickLinksFolderId = globalSettings.quickLinksFolderId || "";
            if (quickLinksFolderId) {
                chrome.bookmarks.getChildren(quickLinksFolderId, function (children) {
                    if (chrome.runtime.lastError) {
                        // Folder was likely deleted
                        quickLinksFolderId = "";
                        quickLinks = [];
                        return;
                    }
                    quickLinks = children.filter(e => e.url != null).map(e => {
                        let parts = e.title.split(":::::");
                        return {
                            id: e.id,
                            title: parts[0],
                            icon: parts[1] || "favicon.png",
                            url: e.url,
                            imageFailed: false
                        };
                    });
                });
            } else {
                quickLinks = [];
            }
        });
    }

    const updateListener = () => loadQuickLinks();

    onMount(() => {
        loadQuickLinks();

        chrome.bookmarks.onCreated.addListener(updateListener);
        chrome.bookmarks.onMoved.addListener(updateListener);
        chrome.bookmarks.onRemoved.addListener(updateListener);
        chrome.bookmarks.onChanged.addListener(updateListener);
    });

    onDestroy(() => {
        chrome.bookmarks.onCreated.removeListener(updateListener);
        chrome.bookmarks.onMoved.removeListener(updateListener);
        chrome.bookmarks.onRemoved.removeListener(updateListener);
        chrome.bookmarks.onChanged.removeListener(updateListener);
    });

    async function onClickEditQuickLink() {
        var c = await open(SelectQuickLinksCollectionModal);
        if (c != null) {
            loadQuickLinks();
        }
    }

    function onClickLink(ql) {
        chrome.tabs.create({ url: ql.url });
    }
</script>

<style>
    .dashbox-div {
        background: var(--tile-bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 10px;
        padding: 5px 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        box-sizing: border-box;
        transition: all 0.2s ease;
        height: 38px;
    }
    .dashbox-div:hover {
        border-color: var(--icon-color);
    }
    .quick-link-img {
        border-radius: 6px;
        padding: 4px;
        transition: transform 0.2s, background-color 0.2s;
        box-sizing: border-box;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.15));
    }
    .quick-link-img:hover {
        transform: translateY(-2px) scale(1.1);
        background-color: var(--outline-btn-hover);
    }
    .fallback-icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        background: var(--outline-btn-hover);
        border: 1px solid var(--outline-btn-border);
        color: var(--icon-color);
        transition: transform 0.2s, background-color 0.2s;
        padding: 0;
        box-sizing: border-box;
    }
    .fallback-icon-btn:hover {
        transform: translateY(-2px) scale(1.1);
        background-color: var(--outline-btn-hover);
        color: var(--txt);
    }
    .edit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        color: var(--icon-color);
        transition: all 0.2s;
        background: transparent;
        border: none;
        padding: 0;
    }
    .edit-btn:hover {
        background-color: var(--outline-btn-hover);
        color: var(--txt);
    }
    .placeholder-text {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--icon-color);
        padding: 0 4px;
        user-select: none;
    }
</style>

<div class="dashbox-div" in:fade>
    {#if quickLinksFolderId}
        {#if quickLinks.length > 0}
            {#each quickLinks as ql (ql.id)}
                <Tooltip title={ql.title || ql.url}>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    {#if ql.imageFailed}
                        <button class="fallback-icon-btn pointer" onclick={(e) => onClickLink(ql)}>
                            <Fa icon={faGlobe} size="sm" color="var(--icon-color)" />
                        </button>
                    {:else}
                        <img
                            alt=""
                            class="pointer quick-link-img"
                            src={ql.icon}
                            height="26px"
                            width="26px"
                            in:fade
                            onerror={() => {
                                ql.imageFailed = true;
                                quickLinks = quickLinks;
                            }}
                            onclick={(e) => onClickLink(ql)}/>
                    {/if}
                </Tooltip>
            {/each}
        {:else}
            <div class="placeholder-text">Quick Links empty</div>
        {/if}
    {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="placeholder-text pointer" onclick={onClickEditQuickLink}>Designate Quick Links</div>
    {/if}
    <Tooltip title="Designate Quick Links">
        <button class="edit-btn pointer" onclick={onClickEditQuickLink}>
            <Fa
                icon={faPenAlt}
                size="sm"
                color="var(--icon-color)"
            />
        </button>
    </Tooltip>
</div>
