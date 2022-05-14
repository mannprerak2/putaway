<script>
    export let globalSettings;
    export let setGlobalSettings;

    var setSaveTabHook = (saveTabHookTitleMatcher, saveTabHookTitleRenamer) => {
        globalSettings.saveTabHookTitleMatcher = saveTabHookTitleMatcher;
        globalSettings.saveTabHookTitleRenamer = saveTabHookTitleRenamer;
        setGlobalSettings(globalSettings);
    }
</script>

<style>
button {
    background-color: gray;
    border-radius: 10px;
    color: white;
    padding: 8px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
}
</style>
<div class="flex-collumn-container" style="align-items: normal;">
    <h1>Save Tab to Collection Hook</h1>
    <h2>Match and Replace Item Name</h2>
    <div class="flex-row-container">
        <input bind:value={globalSettings.saveTabHookTitleMatcher} type="text" placeholder="Regexp Match" style="font-size: 1.7em"/>
        &nbsp
        <input bind:value={globalSettings.saveTabHookTitleRenamer} type="text" placeholder="Regexp Replace" style="font-size: 1.7em"/>
        &nbsp
        <button class="pointer" on:click={()=>setGlobalSettings(globalSettings)}>Save</button>
    </div>
    <p>Example if a tab has a title - <b>BLABLABLA Important This is relevant</b> and you want to rename it to <b>This is relevant"</b> <br> you can match it with <b>.*Important(.*)</b> and replace it with <b>$1"</b> </p>
    &nbsp
    &nbsp
    &nbsp
    &nbsp
</div>
