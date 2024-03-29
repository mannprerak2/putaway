let globalSettings;

export async function loadGlobalSettings() {
    globalSettings = (await chrome.storage.sync.get("globalSettings")).globalSettings || {}
    return globalSettings
}

export function saveTabHook(tab){
    if (!globalSettings) return

    // TODO: expose these settings via an Options Page
    if (globalSettings.saveTabHookTitleMatcher && globalSettings.saveTabHookTitleRenamer) {
        try{
            let matcher = globalSettings.saveTabHookTitleMatcher
            let groups = tab.title.match(matcher)
            console.log(groups)
            if (groups.length < 2) return
            let renamer = globalSettings.saveTabHookTitleRenamer
            // Replace groups if in renamer.
            for (var i=1; i<groups.length; i++) {
                renamer = renamer.replace(`\$${i}`, groups[i])
            }
            tab.title = renamer
        }catch(e){}
    }
}

export function useTabGroupInOpenAllTabs() {
    if (!globalSettings || !globalSettings.useTabGroupInOpenAllTabs) return 'open'
    return globalSettings.useTabGroupInOpenAllTabs
}

export function getItemTileWidth() {
    if (!globalSettings || !globalSettings.itemTileWidth) return 15;
    return globalSettings.itemTileWidth
}

export function getOpenTabsBarWidth() {
    if (!globalSettings || !globalSettings.openTabsBarWidth) return 20;
    return globalSettings.openTabsBarWidth
}

export function getReloadBookmarkSectionOnChange() {
    if (!globalSettings || globalSettings.reloadBookmarkSectionOnChange === undefined) return true;
    return globalSettings.reloadBookmarkSectionOnChange
}

export function getReloadOpenTabsSectionOnChange() {
    if (!globalSettings || globalSettings.reloadOpenTabsSectionOnChange === undefined) return true;
    return globalSettings.reloadOpenTabsSectionOnChange
}

// This is set when we create/move/update/delete via the new tab page only.
let lastNewTabOperationTime = Date.now();

export function getlastNewTabOperationTimeNowDiffMs() {
    return Date.now() - lastNewTabOperationTime;
}

export function setlastNewTabOperationTimeNow() {
    lastNewTabOperationTime = Date.now();
}
