<script>
    import { onMount } from 'svelte';
    import TabTile from './tiles/TabTile.svelte';

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

        var dragIndex = parseInt(e.dataTransfer.getData('text'));
        // move tabs from dragIndex to dropIndex
        chrome.tabs.move(allTabs[dragIndex].id, { index: dropIndex });
        allTabs.splice(dropIndex, 0, allTabs.splice(dragIndex, 1)[0]);
        allTabs = allTabs;
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
        <div style="height: 200px;"></div>
    </div>
</div>