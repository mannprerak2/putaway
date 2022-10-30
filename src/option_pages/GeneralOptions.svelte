<script>
    import { getItemTileWidth, getOpenTabsBarWidth,
        getReloadBookmarkSectionOnChange, getReloadOpenTabsSectionOnChange } from "../services/hooks.js";

    export let darkTheme;
    export let changeTheme;

    export let globalSettings;
    export let setGlobalSettings;

    var setUseTabGroupInOpenAllTabs = (val) => {
        globalSettings.useTabGroupInOpenAllTabs = val;
        setGlobalSettings(globalSettings);
    }
    let temporaryItemTileWidth = getItemTileWidth()
    var setItemTileWidth = () => {
        globalSettings.itemTileWidth = temporaryItemTileWidth;
        setGlobalSettings(globalSettings);
    }

    let temporaryOpenTabsBarWidth = getOpenTabsBarWidth()
    var setOpenTabsBarWidth = () => {
        globalSettings.openTabsBarWidth = temporaryOpenTabsBarWidth;
        setGlobalSettings(globalSettings);
    }

    let reloadBookmarkSectionOnChange = getReloadBookmarkSectionOnChange();
    var setReloadBookmarkSectionOnChange = () => {
        globalSettings.reloadBookmarkSectionOnChange = reloadBookmarkSectionOnChange;
        setGlobalSettings(globalSettings);
    }

    let reloadOpenTabsSectionOnChange = getReloadOpenTabsSectionOnChange();
    var setReloadOpenTabsSectionOnChange = () => {
        globalSettings.reloadOpenTabsSectionOnChange = reloadOpenTabsSectionOnChange;
        setGlobalSettings(globalSettings);
    }
</script>

<style>
</style>
<div class="flex-collumn-container" style="align-items: normal;">
    <h1>Theme</h1>
    <div class="flex-row-container">
        {#if darkTheme}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>changeTheme(false)}>Light</div>
            &nbsp &nbsp
            <div class="rounded-button pointer" style="font-size: 1.2em; background-color: #00ff0022;">Dark</div>
        {:else}
            <div class="rounded-button pointer" style="font-size: 1.2em; background-color: #00ff0022;">Light</div>
            &nbsp &nbsp
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>changeTheme(true)}>Dark</div>
        {/if}
    </div>
    <h1 class="settings-section-padding">Collection - Open all tabs</h1>
    <div class="flex-row-container">
        {#if globalSettings.useTabGroupInOpenAllTabs == "openTabGroup"}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em; background-color: #00ff0022;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabGroup')}>Open in Tab Group</div>
            &nbsp &nbsp
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('open')}>Open in Current Window</div>
            &nbsp &nbsp
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabWindow')}>Open in New Window</div>
        {:else if globalSettings.useTabGroupInOpenAllTabs == "openTabWindow"}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabGroup')}>Open in Tab Group</div>
            &nbsp &nbsp
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('open')}>Open in Current Window</div>
            &nbsp &nbsp
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em; background-color: #00ff0022;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabWindow')}>Open in New Window</div>
        {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabGroup')}>Open in Tab Group</div>
            &nbsp &nbsp
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em; background-color: #00ff0022;" on:click={()=>setUseTabGroupInOpenAllTabs('open')}>Open in Current Window</div>
            &nbsp &nbsp
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabWindow')}>Open in New Window</div>
        {/if}
    </div>
    <h1 class="settings-section-padding">Collection Item width</h1>
    <div class="flex-row-container">
        <input bind:value={temporaryItemTileWidth} type="number" style="font-size: 1.7em; width: 3em"/>
        &nbsp
        <button class="pointer save-button" on:click={setItemTileWidth}>Save</button>
    </div>
    <div style="width: {temporaryItemTileWidth}em; word-break: break-all; border: 1px solid var(--box-shadow); padding: 3px; ">This is how it'll look</div>
    <h1 class="settings-section-padding">Open Tabs Sidebar width</h1>
    <div class="flex-row-container">
        <input bind:value={temporaryOpenTabsBarWidth} type="number" style="font-size: 1.7em; width: 3em"/>
        &nbsp
        <button class="pointer save-button" on:click={setOpenTabsBarWidth}>Save</button>
    </div>
    <div style="width: {temporaryOpenTabsBarWidth}vw; word-break: break-all; border: 1px solid var(--box-shadow); padding: 3px; ">This is how it'll look</div>
    <div class="flex-row-container">
        <h1>Reload Collections on Bookmark updates</h1>
        <input id="aaaa" type="checkbox" class="large-checkbox" style="background-color: aqua;" bind:checked={reloadBookmarkSectionOnChange} on:change={setReloadBookmarkSectionOnChange}/>
    </div>
    <div class="flex-row-container">
        <h1>Reload Open-Tabs section on Tab updates</h1>
        <input id="aaaa" type="checkbox" class="large-checkbox" bind:checked={reloadOpenTabsSectionOnChange} on:change={setReloadOpenTabsSectionOnChange}/>
    </div>
</div>
