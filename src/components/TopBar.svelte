<script>
    import { searchText, archiveOnly } from "../stores/stores.js";
    import { onDestroy } from "svelte";
    import Quicklinks from "./QuickLinks.svelte";
    import Tooltip from "./common/tooltip/Tooltip.svelte"
    export let darkTheme;
    export let toggleTheme;

    //font awesome icons
    import Fa from "sveltejs-fontawesome";
    import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
    import { faSun } from "@fortawesome/free-solid-svg-icons/faSun";
    import { faMoon } from "@fortawesome/free-solid-svg-icons/faMoon";
    import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
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

    onDestroy(unsubscribe);
</script>

<style>
    input {
        border: none;
        font-size: 2.5em;
        outline: none;
        background-color: var(--bg);
        color: rgb(117, 117, 117);
    }
    .search-div{
        padding: 6px;
        padding-left: 40px;
        border: 1px dashed gray;
        border-radius: 20px;
        margin-top: 8px;
        margin-right: 16px;
    }
    .search-logo {
        position: absolute;
        left: 1.3rem;
        opacity: var(--icon-opacity);
        top: 1.8rem;
    }
</style>

<main>
    <div class="flex-row-container">
        <div class="search-div flex-row-container">
            <input type="text" placeholder="Search" bind:value={$searchText} style="width: 150px"/>
            <div class="search-logo">
                <Fa icon={faSearch} size="2x" color="var(--icon-color)" />
            </div>
            {#if $searchText.length>0}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div on:click={()=>{$searchText=""}} class="pointer" style="font-size: 2em;">
                    <Fa icon={faTimesCircle} size="sm" color="var(--icon-color)" />
                </div>
            {:else}
            <div style="font-size: 2em; visibility: hidden;">
                <Fa icon={faTimesCircle} size="sm" color="var(--icon-color)" />
            </div>
            {/if}
        </div>
        <Quicklinks/>
        <div style="flex-grow:1;" />
        <Tooltip title="Toggle Archived Collections">
            {#if archive}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
                id="view-archive-button"
                class="rounded-button pointer"
                style="font-size: 1.5em; background-color: #00ff0022"
                on:click={toggleArchive}>
                Archive
            </div>
            {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
                id="view-archive-button"
                class="rounded-button pointer"
                style="font-size: 1.5em;"
                on:click={toggleArchive}>
                Archive
            </div>
            {/if}
        </Tooltip>

        &nbsp
        <Tooltip title="Toggle Theme">
            {#if darkTheme}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div on:click={toggleTheme} class="pointer" style="font-size: 2em;">
                    <Fa icon={faSun} size="sm" color="var(--icon-color)" />
                </div>
            {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div on:click={toggleTheme} class="pointer" style="font-size: 2em;">
                    <Fa icon={faMoon} size="sm" color="var(--icon-color)" />
                </div>
            {/if}
        </Tooltip>
        &nbsp &nbsp
        <Tooltip title="Open Settings">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div on:click={openOptionsPage} class="pointer" style="font-size: 2em;">
                <Fa icon={faCog} size="sm" color="var(--icon-color)" />
            </div>
        </Tooltip>
    </div>
</main>
