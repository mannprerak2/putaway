<script>
    import { onMount } from 'svelte';
    import TabTile from './tiles/TabTile.svelte';
    import EmptyTabTile from './tiles/EmptyTabTile.svelte'

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
        // first letter is t if a tab is dropped
        if (rawData[0] == "t") {
            var dragIndex = parseInt(rawData.substr(1));
            // move tabs from dragIndex to dropIndex
            if (dragIndex >= dropIndex) {
                chrome.tabs.move(allTabs[dragIndex].id, { index: dropIndex });
                allTabs.splice(dropIndex, 0, allTabs[dragIndex]);
                allTabs.splice(dragIndex + 1, 1);
            }
            else {
                chrome.tabs.move(allTabs[dragIndex].id, { index: dropIndex - 1 });
                allTabs.splice(dropIndex, 0, allTabs[dragIndex]);
                allTabs.splice(dragIndex, 1);
            }
            allTabs = allTabs;
        } else if (rawData[0] == "i") {
            // DO NOTHING
        }
    }
</script>
<style>
</style>

<div>
    <h2>Open Tabs - {allTabs.length}</h2>

    <div class="scroll">
        {#each allTabs as tab,i (tab.id)}
            <TabTile {tab} index={i} {onClickTabCard} {onTabTileClose} {onDrop}/>
        {/each}
        <EmptyTabTile index={allTabs.length} {onDrop}/>
    </div>
</div>