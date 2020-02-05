<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';

    let allTabs = [];

    onMount(() => {
        chrome.tabs.query({
            currentWindow: true,
        }, (tabs) => {
            allTabs = tabs;
        });
    });

    var onClickTabCard = (tab) => {
        chrome.tabs.update(tab.id, { active: true });
    } 
</script>
<style>
    .card {
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        margin: 8px;
        padding: 8px;
    }

    .card:hover {
        background-color: rgba(240, 240, 240, 1);
        border: 1px solid black;
        cursor: grab;
        /* padding: (p-1)px to prevent shifting */
        padding: 7px;
    }
</style>

<main>
    <h2>Tabs Open - {allTabs.length}</h2>

    {#each allTabs as tab}
        <div class="card" draggable="true" in:fly="{{ x: 500, duration: 400 }}" out:fade on:click|preventDefault={()=> onClickTabCard(tab)}>
            {tab.title}
        </div>
    {/each}
</main>