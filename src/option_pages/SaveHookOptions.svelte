<script>
    export let globalSettings;
    export let setGlobalSettings;

    let tempSaveHookSettings = {
        saveTabHookTitleMatcher: globalSettings.saveTabHookTitleMatcher,
        saveTabHookTitleRenamer: globalSettings.saveTabHookTitleRenamer,
    };
    var setSaveTabHook = () => {
        globalSettings.saveTabHookTitleMatcher = tempSaveHookSettings.saveTabHookTitleMatcher;
        globalSettings.saveTabHookTitleRenamer = tempSaveHookSettings.saveTabHookTitleRenamer;
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
        padding: 24px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .input-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }
    .text-input {
        background: var(--bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 6px;
        padding: 8px 14px;
        font-size: 0.9rem;
        outline: none;
        color: var(--txt);
        transition: border-color 0.2s;
        flex-grow: 1;
        min-width: 180px;
        box-sizing: border-box;
    }
    .text-input:focus {
        border-color: var(--accent);
    }
    .help-box {
        font-size: 0.85rem;
        line-height: 1.5;
        color: var(--icon-color);
        background: var(--outline-btn-hover);
        padding: 16px;
        border-radius: 8px;
        border-left: 4px solid var(--accent);
        margin: 0;
    }
    .help-box b {
        color: var(--txt);
    }
</style>

<div class="settings-container">
    <div class="settings-section">
        <h2 class="settings-section-title">Save Tab to Collection Hook</h2>
        <div class="settings-card">
            <p style="font-size: 0.9rem; margin: 0 0 8px 0; color: var(--icon-color); line-height: 1.4;">
                Automatically match and rename bookmark item titles using Regular Expressions when saving tabs.
            </p>
            
            <div class="input-row">
                <input bind:value={tempSaveHookSettings.saveTabHookTitleMatcher} type="text" class="text-input" placeholder="Regex Match Pattern (e.g. .*Important(.*))" />
                <input bind:value={tempSaveHookSettings.saveTabHookTitleRenamer} type="text" class="text-input" placeholder="Regex Replace String (e.g. $1)" />
                <button class="pointer save-button" onclick={setSaveTabHook}>Save Hook</button>
            </div>
            
            <div class="help-box">
                <strong>Example:</strong> If a tab is titled <b>"PROJECT X: Design Specifications"</b> and you only want to save <b>"Design Specifications"</b>:<br />
                - Match Pattern: <b>.*PROJECT X:(.*)</b><br />
                - Replace String: <b>$1</b>
            </div>
        </div>
    </div>
</div>
