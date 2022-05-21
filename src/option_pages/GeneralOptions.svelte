<script>
    import { getItemTileWidth, getOpenTabsBarWidth } from "../services/hooks";


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
</script>

<style>
</style>
<div class="flex-collumn-container" style="align-items: normal;">
    <h1>Theme</h1>
    <div class="flex-row-container">
        {#if darkTheme}
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>changeTheme(false)}>Light</div>
            &nbsp &nbsp
            <div class="rounded-button pointer" style="font-size: 1.2em; background-color: #00ff0022;">Dark</div>
        {:else}
            <div class="rounded-button pointer" style="font-size: 1.2em; background-color: #00ff0022;">Light</div>
            &nbsp &nbsp
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>changeTheme(true)}>Dark</div>
        {/if}
    </div>
    <h1 class="settings-section-padding">Collection - Open all tabs</h1>
    <div class="flex-row-container">
        {#if globalSettings.useTabGroupInOpenAllTabs == "openTabGroup"}
            <div class="rounded-button pointer" style="font-size: 1.2em; background-color: #00ff0022;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabGroup')}>Open in Tab Group</div>
            &nbsp &nbsp
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('open')}>Open in Current Window</div>
            &nbsp &nbsp
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabWindow')}>Open in New Window</div>
        {:else if globalSettings.useTabGroupInOpenAllTabs == "openTabWindow"}
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabGroup')}>Open in Tab Group</div>
            &nbsp &nbsp
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('open')}>Open in Current Window</div>
            &nbsp &nbsp
            <div class="rounded-button pointer" style="font-size: 1.2em; background-color: #00ff0022;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabWindow')}>Open in New Window</div>
        {:else}
            <div class="rounded-button pointer" style="font-size: 1.2em;" on:click={()=>setUseTabGroupInOpenAllTabs('openTabGroup')}>Open in Tab Group</div>
            &nbsp &nbsp
            <div class="rounded-button pointer" style="font-size: 1.2em; background-color: #00ff0022;" on:click={()=>setUseTabGroupInOpenAllTabs('open')}>Open in Current Window</div>
            &nbsp &nbsp
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
</div>
