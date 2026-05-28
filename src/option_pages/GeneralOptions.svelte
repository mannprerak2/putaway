<script>
    import { getItemTileWidth, getOpenTabsBarWidth,
        getReloadBookmarkSectionOnChange, getReloadOpenTabsSectionOnChange } from "../services/hooks.js";
    import { onMount } from "svelte";

    export let darkTheme;
    export let changeTheme;

    export let globalSettings;
    export let setGlobalSettings;

    let collections = [];
    onMount(() => {
        chrome.storage.local.get("pid", function (localRes) {
            if (localRes.pid) {
                chrome.bookmarks.getChildren(localRes.pid, function (children) {
                    collections = children.filter((e) => e.url == null);
                });
            }
        });
    });

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
    .settings-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 650px;
        padding-bottom: 40px;
    }
    .settings-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .settings-section-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
        color: var(--txt);
    }
    .settings-card {
        background: var(--tile-bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 10px;
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .settings-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
    }
    .settings-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex-grow: 1;
    }
    .settings-title {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--txt);
        margin: 0;
    }
    .settings-subtitle {
        font-size: 0.8rem;
        color: var(--icon-color);
        line-height: 1.4;
        margin: 0;
    }
    .segmented-control {
        display: inline-flex;
        background: var(--outline-btn-hover);
        padding: 4px;
        border-radius: 8px;
        border: 1px solid var(--outline-btn-border);
        gap: 4px;
    }
    .segmented-btn {
        padding: 6px 14px;
        font-size: 0.85rem;
        font-weight: 500;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: var(--icon-color);
        transition: all 0.2s;
        cursor: pointer;
    }
    .segmented-btn.active {
        background: var(--bg);
        color: var(--txt);
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .number-input-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .text-input {
        background: var(--bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 0.9rem;
        outline: none;
        color: var(--txt);
        transition: border-color 0.2s;
        width: 80px;
        box-sizing: border-box;
        text-align: center;
    }
    .text-input:focus {
        border-color: var(--accent);
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
    }
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--outline-btn-hover);
        border: 1px solid var(--outline-btn-border);
        transition: .3s;
        border-radius: 24px;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 3px;
        bottom: 3px;
        background-color: var(--icon-color);
        transition: .3s;
        border-radius: 50%;
    }
    input:checked + .slider {
        background-color: var(--accent);
        border-color: var(--accent);
    }
    input:checked + .slider:before {
        transform: translateX(20px);
        background-color: white;
    }
    .preview-box {
        font-size: 0.8rem;
        font-weight: 500;
        border-radius: 6px;
        background: var(--tile-bg);
        border: 1px dashed var(--outline-btn-border);
        padding: 12px;
        text-align: center;
        color: var(--icon-color);
        box-sizing: border-box;
        transition: width 0.2s ease;
    }
</style>

<div class="settings-container">
    <!-- Section: Appearance -->
    <div class="settings-section">
        <h2 class="settings-section-title">Appearance</h2>
        <div class="settings-card">
            <div class="settings-row">
                <div class="settings-info">
                    <h3 class="settings-title">Theme Mode</h3>
                    <p class="settings-subtitle">Switch between light and dark visual interfaces.</p>
                </div>
                <div class="segmented-control">
                    <button class="segmented-btn" class:active={!darkTheme} onclick={() => changeTheme(false)}>Light</button>
                    <button class="segmented-btn" class:active={darkTheme} onclick={() => changeTheme(true)}>Dark</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Section: Collection Options -->
    <div class="settings-section">
        <h2 class="settings-section-title">Collections & Actions</h2>
        <div class="settings-card">
            <div class="settings-row">
                <div class="settings-info">
                    <h3 class="settings-title">"Open All" Behavior</h3>
                    <p class="settings-subtitle">How tabs inside a collection should open when clicked.</p>
                </div>
                <div class="segmented-control">
                    <button class="segmented-btn" class:active={globalSettings.useTabGroupInOpenAllTabs === "openTabGroup"} onclick={() => setUseTabGroupInOpenAllTabs('openTabGroup')}>Tab Group</button>
                    <button class="segmented-btn" class:active={globalSettings.useTabGroupInOpenAllTabs === "open" || !globalSettings.useTabGroupInOpenAllTabs} onclick={() => setUseTabGroupInOpenAllTabs('open')}>Current Window</button>
                    <button class="segmented-btn" class:active={globalSettings.useTabGroupInOpenAllTabs === "openTabWindow"} onclick={() => setUseTabGroupInOpenAllTabs('openTabWindow')}>New Window</button>
                </div>
            </div>

            <hr style="border: 0; border-top: 1px solid var(--collection-separator); margin: 8px 0;" />

            <div class="settings-row">
                <div class="settings-info">
                    <h3 class="settings-title">Collection Item Width</h3>
                    <p class="settings-subtitle">Customize the default layout width of bookmark item tiles (in em).</p>
                </div>
                <div class="number-input-group">
                    <input bind:value={temporaryItemTileWidth} type="number" class="text-input" />
                    <button class="pointer save-button" onclick={setItemTileWidth}>Save</button>
                </div>
            </div>
            <div class="preview-box" style="width: {temporaryItemTileWidth}em;">
                Tile Width Preview
            </div>

            <hr style="border: 0; border-top: 1px solid var(--collection-separator); margin: 8px 0;" />

            <div class="settings-row">
                <div class="settings-info">
                    <h3 class="settings-title">Quick Links Collection</h3>
                    <p class="settings-subtitle">Pick the collection folder to display in your Quick Links bar.</p>
                </div>
                <select 
                    class="text-input" 
                    style="width: auto; text-align: left; padding: 6px 12px; border-radius: 8px;"
                    value={globalSettings.quickLinksFolderId || ""}
                    onchange={(e) => {
                        globalSettings.quickLinksFolderId = e.target.value;
                        setGlobalSettings(globalSettings);
                    }}
                >
                    <option value="">-- None Selected --</option>
                    {#each collections as collection}
                        <option value={collection.id}>{collection.title}</option>
                    {/each}
                </select>
            </div>
        </div>
    </div>

    <!-- Section: Sidebar Options -->
    <div class="settings-section">
        <h2 class="settings-section-title">Sidebar Layout</h2>
        <div class="settings-card">
            <div class="settings-row">
                <div class="settings-info">
                    <h3 class="settings-title">Open Tabs Sidebar Width</h3>
                    <p class="settings-subtitle">Configure the width of the right open tabs pane (in % of viewport).</p>
                </div>
                <div class="number-input-group">
                    <input bind:value={temporaryOpenTabsBarWidth} type="number" class="text-input" />
                    <button class="pointer save-button" onclick={setOpenTabsBarWidth}>Save</button>
                </div>
            </div>
            <div class="preview-box" style="width: 100%; max-width: 300px;">
                Sidebar Width: {temporaryOpenTabsBarWidth}%
            </div>
        </div>
    </div>

    <!-- Section: Sync and Reload Updates -->
    <div class="settings-section">
        <h2 class="settings-section-title">Updates & Reloads</h2>
        <div class="settings-card">
            <div class="settings-row">
                <div class="settings-info">
                    <h3 class="settings-title">Auto-Reload Collections</h3>
                    <p class="settings-subtitle">Refresh collection lists dynamically on bookmark updates.</p>
                </div>
                <label class="switch">
                    <input type="checkbox" bind:checked={reloadBookmarkSectionOnChange} onchange={setReloadBookmarkSectionOnChange}/>
                    <span class="slider"></span>
                </label>
            </div>

            <hr style="border: 0; border-top: 1px solid var(--collection-separator); margin: 8px 0;" />

            <div class="settings-row">
                <div class="settings-info">
                    <h3 class="settings-title">Auto-Reload Open Tabs</h3>
                    <p class="settings-subtitle">Refresh open tabs panel dynamically on tab list updates.</p>
                </div>
                <label class="switch">
                    <input type="checkbox" bind:checked={reloadOpenTabsSectionOnChange} onchange={setReloadOpenTabsSectionOnChange}/>
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    </div>
</div>
