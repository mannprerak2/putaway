<script>
    import Tooltip from './common/tooltip/Tooltip.svelte'
    import { onMount, getContext } from "svelte";
    import { fade } from "svelte/transition";
    const { open } = getContext("simple-modal");
    import EditQuickLinksModal from "./modals/EditQuickLinksModal.svelte";

    // FontAwesome icons.
    import Fa from "sveltejs-fontawesome";
    import { faPenAlt } from "@fortawesome/free-solid-svg-icons/faPenAlt";

    let quickLinks = [];
    onMount(() => {
        chrome.storage.sync.get("quickLinks", function (v) {
            if (v.quickLinks) {
                quickLinks = v.quickLinks;
            }
        });
    });

    async function onClickEditQuickLink() {
        var c = await open(EditQuickLinksModal, { quickLinks });
        if (c != null) {
            quickLinks = c;
            chrome.storage.sync.set({ quickLinks: quickLinks });
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
    }
    .quick-link-img:hover {
        transform: translateY(-2px) scale(1.1);
        background-color: var(--outline-btn-hover);
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
    }
</style>

<div class="dashbox-div" in:fade>
    {#if quickLinks.length > 0}
        {#each quickLinks as ql}
            <Tooltip title={ql.url}>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img
                    alt={ql.url}
                    class="pointer quick-link-img"
                    src={ql.icon}
                    height="26px"
                    width="26px"
                    in:fade
                    onclick={(e) => onClickLink(ql)}/>
            </Tooltip>
        {/each}
    {:else}
        <div class="placeholder-text">Quick Links</div>
    {/if}
    <Tooltip title="Edit Links">
        <button class="edit-btn pointer" onclick={onClickEditQuickLink}>
            <Fa
                icon={faPenAlt}
                size="sm"
                color="var(--icon-color)"
            />
        </button>
    </Tooltip>
</div>
