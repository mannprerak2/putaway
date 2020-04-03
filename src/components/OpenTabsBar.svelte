<script>
    import { onMount, onDestroy, getContext } from 'svelte';
    import TabTile from './tiles/TabTile.svelte';
    import EmptyTabTile from './tiles/EmptyTabTile.svelte'
    import { deo } from './../stores/dropEventStore.js';
    const { open } = getContext('simple-modal');
    import SaveSessionModal from './modals/SaveSessionModal.svelte';

    let allTabs = [];

    onMount(() => {
        chrome.tabs.query({
            currentWindow: true,
        }, (tabs) => {
            allTabs = tabs.filter(function (tab) {
                return tab.url != 'chrome://newtab/';
            });
        });
    });

    const unsubsribe = deo.subscribe(obj => {
        if (obj.source[0] == "t") {
            if (obj.target[0] == "i") {
                if (obj.ctrl != null && !obj.ctrl) { //  only delete tab if ctrl wasn't held by user
                    chrome.tabs.remove(obj.sourceObj.id);
                    allTabs.splice(parseInt(obj.source.substr(1)), 1);
                    allTabs = allTabs;
                }
            } else if (obj.target[0] == "t") {
                var dragIndex = parseInt(obj.source.substr(1));
                var dropIndex = parseInt(obj.target.substr(1))
                // move tabs from dragIndex to dropIndex
                if (dragIndex >= dropIndex) {
                    chrome.tabs.move(obj.sourceObj.id, { index: dropIndex });
                    allTabs.splice(dropIndex, 0, obj.sourceObj);
                    allTabs.splice(dragIndex + 1, 1);
                }
                else {
                    chrome.tabs.move(obj.sourceObj.id, { index: dropIndex - 1 });
                    allTabs.splice(dropIndex, 0, obj.sourceObj);
                    allTabs.splice(dragIndex, 1);
                }
                allTabs = allTabs;
            }
        }
    });
    onDestroy(unsubsribe);

    var onClickTabCard = (tab) => {
        chrome.tabs.update(tab.id, { active: true });
    }

    var onTabTileClose = (tab, i) => {
        allTabs.splice(i, 1);
        allTabs = allTabs;
        chrome.tabs.remove(tab.id);
    }

    var onDrop = (e, dropIndex) => {
        e.preventDefault();
        var rawData = e.dataTransfer.getData('text');
        var obj = JSON.parse(e.dataTransfer.getData('object'));
        deo.set({
            source: rawData,
            target: "t" + dropIndex.toString(),
            sourceObj: obj,
            targetObj: allTabs[dropIndex]
        });
    }

    var saveSession = async () => {
        var c = await open(SaveSessionModal);
        if (c) {
            var count = allTabs.length;
            allTabs.forEach(tab => {
                chrome.bookmarks.create({
                    parentId: c.id,
                    url: tab.url,
                    title: tab.title + ":::::" + tab.favIconUrl
                }, function (node) {
                    count--;
                    if (count == 0) {
                        // reload tab to take effect
                        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            chrome.tabs.reload(tabs[0].id);
                        });
                    }
                });
            });
        }
    }
</script>
<style>
</style>

<div>
    <div class="flex-row-container">
        <div style="font-size: 1.8em;">Open Tabs - {allTabs.length}</div>
        <div style="flex-grow:1;" />
        {#if allTabs.length>0}
        <div class="rounded-button pointer" style="font-size: 1em;" on:click={saveSession}>Save Session</div>
        {/if}
    </div>

    <div class="scroll">
        {#each allTabs as tab,i (tab.id)}
            <TabTile {tab} index={i} {onClickTabCard} {onTabTileClose} {onDrop}/>
        {/each}
        <EmptyTabTile index={allTabs.length} {onDrop}/>
    </div>
</div>