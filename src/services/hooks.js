let globalSettings;

chrome.storage.sync.get("globalSettings", function (v) {
    globalSettings = v.globalSettings
});

export function saveTabHook(tab){
    if (!globalSettings) return

    // TODO: expose these settings via an Options Page
    if (globalSettings.saveTabHookTitleMatcher && globalSettings.saveTabHookTitleRenamer) {
        try{
            let matcher = globalSettings.saveTabHookTitleMatcher
            let groups = tab.title.match(matcher)
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
