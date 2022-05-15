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
</style>
<div class="flex-collumn-container" style="align-items: normal;">
    <h1>Save Tab to Collection Hook</h1>
    <h2>Match and Replace Item Name</h2>
    <div class="flex-row-container">
        <input bind:value={tempSaveHookSettings.saveTabHookTitleMatcher} type="text" placeholder="Regexp Match" style="font-size: 1.7em"/>
        &nbsp
        <input bind:value={tempSaveHookSettings.saveTabHookTitleRenamer} type="text" placeholder="Regexp Replace" style="font-size: 1.7em"/>
        &nbsp
        <button class="pointer save-button" on:click={setSaveTabHook}>Save</button>
    </div>
    <p>Example if a tab has a title - <b>BLABLABLA Important This is relevant</b> and you want to rename it to <b>This is relevant"</b> <br> you can match it with <b>.*Important(.*)</b> and replace it with <b>$1"</b> </p>
</div>
