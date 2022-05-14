<script>
    export let darkTheme;
    export let changeTheme;

    export let globalSettings;
    export let setGlobalSettings;

    var setUseTabGroupInOpenAllTabs = (val) => {
        globalSettings.useTabGroupInOpenAllTabs = val;
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
    &nbsp
    &nbsp
    &nbsp
    &nbsp
    &nbsp
    <h1>Collection - Open all tabs</h1>
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
</div>
