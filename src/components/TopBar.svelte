<script>
    import { searchText, archiveOnly } from "../stores/stores.js";
    import { onDestroy, getContext } from "svelte";
    import Quicklinks from "./QuickLinks.svelte";
    import Tooltip from "./common/tooltip/Tooltip.svelte"
    import HelpModal from "./modals/HelpModal.svelte";

    export let darkTheme;
    export let toggleTheme;

    const { open } = getContext("simple-modal");

    //font awesome icons
    import Fa from "sveltejs-fontawesome";
    import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
    import { faSun } from "@fortawesome/free-solid-svg-icons/faSun";
    import { faMoon } from "@fortawesome/free-solid-svg-icons/faMoon";
    import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
    import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons/faQuestionCircle";
    import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";
    //font awesome icons

    let archive;
	const unsubscribe = archiveOnly.subscribe(value => {
		archive = value;
	});
    var toggleArchive = () => {
        archive = !archive
        archiveOnly.set(archive)
        searchText.set("")
    };
    var openOptionsPage = () => {
        chrome.runtime.openOptionsPage();
    }
    var openHelpModal = () => {
        open(HelpModal);
    }

    onDestroy(unsubscribe);
</script>

<style>
    input {
        border: none;
        font-size: 1rem;
        font-weight: 500;
        outline: none;
        background: transparent;
        color: var(--txt);
        width: 100%;
        padding-left: 4px;
        padding-right: 4px;
    }
    input::placeholder {
        color: var(--icon-color);
        opacity: 0.65;
    }
    .search-div {
        position: relative;
        padding: 5px 10px 5px 32px;
        background: var(--tile-bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 8px;
        margin-right: 12px;
        transition: all 0.2s ease;
        width: 200px;
        box-sizing: border-box;
    }
    .search-div:focus-within {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-glow);
        background: var(--bg);
    }
    .search-logo {
        position: absolute;
        left: 10px;
        opacity: var(--icon-opacity);
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
    }
    .clear-btn {
        opacity: 0.7;
        transition: opacity 0.2s, transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .clear-btn:hover {
        opacity: 1;
        transform: scale(1.1);
    }
    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid transparent;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        color: var(--icon-color);
        background: transparent;
    }
    .icon-btn:hover {
        background-color: var(--outline-btn-hover);
        color: var(--txt);
        transform: scale(1.05);
    }
    .icon-btn:active {
        transform: scale(0.95);
    }
    #view-archive-button {
        font-size: 0.8rem;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid var(--outline-btn-border);
        background: transparent;
        color: var(--txt);
    }
    #view-archive-button.active {
        background-color: var(--accent);
        color: var(--accent-txt, #ffffff);
        border-color: var(--accent);
        box-shadow: 0 0 12px var(--accent-glow);
    }
    #view-archive-button:hover {
        transform: translateY(-1px);
    }
    #view-archive-button.active:hover {
        background-color: var(--accent-hover);
    }
</style>

<main>
    <div class="flex-row-container" style="width: 100%;">
        <div class="search-div flex-row-container">
            <div class="search-logo">
                <Fa icon={faSearch} size="sm" color="var(--icon-color)" />
            </div>
            <input type="text" placeholder="Search tabs..." bind:value={$searchText} />
            {#if $searchText.length > 0}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <button onclick={(e)=>{$searchText=""}} class="clear-btn pointer">
                    <Fa icon={faTimesCircle} size="sm" color="var(--icon-color)" />
                </button>
            {:else}
                <div style="width: 14px; visibility: hidden;">
                    <Fa icon={faTimesCircle} size="sm" color="var(--icon-color)" />
                </div>
            {/if}
        </div>
        <Quicklinks />
        <div style="flex-grow: 1;" />
        <div class="flex-row-container" style="gap: 12px;">
            <Tooltip title="Toggle Archived Collections">
                <button
                    id="view-archive-button"
                    class={archive ? "active" : ""}
                    onclick={toggleArchive}>
                    Archive
                </button>
            </Tooltip>

            <Tooltip title="Toggle Theme">
                <button onclick={toggleTheme} class="icon-btn pointer">
                    {#if darkTheme}
                        <Fa icon={faSun} size="sm" color="var(--icon-color)" />
                    {:else}
                        <Fa icon={faMoon} size="sm" color="var(--icon-color)" />
                    {/if}
                </button>
            </Tooltip>

            <Tooltip title="How it Works / Help">
                <button onclick={openHelpModal} class="icon-btn pointer">
                    <Fa icon={faQuestionCircle} size="sm" color="var(--icon-color)" />
                </button>
            </Tooltip>

            <Tooltip title="Open Settings">
                <button onclick={openOptionsPage} class="icon-btn pointer">
                    <Fa icon={faCog} size="sm" color="var(--icon-color)" />
                </button>
            </Tooltip>
        </div>
    </div>
</main>
