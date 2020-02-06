<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';

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
</script>
<style>
    .card {
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        margin: 8px;
        padding: 8px;
        position: relative;
        height: 2em;
    }

    .card:hover {
        background-color: rgba(240, 240, 240, 1);
        border: 1px solid black;
        cursor: grab;
        /* padding: (p-1)px to prevent shifting */
        padding: 7px;
    }

    .close-icon {
        display: none;
    }

    .card:hover .close-icon {
        position: absolute;
        right: -16px;
        margin-right: 10px;
        bottom: 0;
        display: block;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border-width: 3px;
        border-style: solid;
        border-color: gray;
        border-radius: 100%;
        background: -webkit-linear-gradient(-45deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%), -webkit-linear-gradient(45deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%);
        background-color: gray;
    }

    .text-concat {
        position: relative;
        display: inline-block;
        word-wrap: break-word;
        overflow: hidden;
        max-height: 2em;
        line-height: 1em;
    }

    .scroll {
        margin: 4px, 4px;
        padding: 4px;
        height: 100vh;
        overflow-x: hidden;
        overflow-x: auto;
        scrollbar-width: 0;
    }

    .scroll::-webkit-scrollbar {
        display: none;
    }
</style>

<main style="height: 100%;">
    <h2>Open Tabs - {allTabs.length}</h2>

    <div class="scroll">
        {#each allTabs as tab,i}
            <div class="card" draggable="true" in:fly="{{ x: 500, duration: 400 }}" out:fade on:click|preventDefault={()=> onClickTabCard(tab)}>
            <button class="close-icon" on:click|preventDefault|stopPropagation={()=> onTabTileClose(tab,i)}></button>
            
            <div class="flex-row-container">
                <img alt='tab' src={tab.favIconUrl} height="20px" style="margin-right: 10px;"/> 
                
                <div class="text-concat">
                    {tab.title}
                </div>
            </div>
        </div>
        {/each}
        <div style="height: 200px;"></div>
    </div>
</main>