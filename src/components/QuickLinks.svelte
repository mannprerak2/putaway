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

<div class="dashbox-div flex-row-container" in:fade>
    {#if quickLinks.length > 0}
        {#each quickLinks as ql}
            <Tooltip title={ql.url}>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img
                    alt=" "
                    class="pointer"
                    src={ql.icon}
                    height="26px"
                    width="26px"
                    style="padding: 5px"
                    in:fade
                    on:click={() => onClickLink(ql)}/>
            </Tooltip>
        {/each}
    {:else}
        <div style="font-size: 2.5em; color: gray">Quick Links</div>
    {/if}
    <Tooltip title="Edit">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="pointer" on:click={onClickEditQuickLink}>
            <Fa
                icon={faPenAlt}
                size=1.5em
                color="var(--icon-color)"
                style="margin-left: 5px"
            />
        </div>
    </Tooltip>
</div>

<style>
    .dashbox-div {
        border: 1px dashed gray;
        border-radius: 20px;
        padding: 6px;
        margin-top: 8px;
    }
</style>
