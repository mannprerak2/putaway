// a few storage utilities (not for location of folder)

export const setDarkTheme = function (v) {
    chrome.storage.sync.set({ dark: v });
}

export const getDarkTheme = function (callback) {
    chrome.storage.sync.get('dark', function (v) {
        if (v.dark) {
            callback(v.dark);
        } else {
            callback(false);
        }
    });
}

