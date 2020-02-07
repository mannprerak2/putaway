<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';

    let allCollections = [];

    onMount(() => {
        chrome.storage.local.get('pid', function (res) {
            chrome.bookmarks.getChildren(res['pid'], function (children) {
                allCollections = children;
            });
        })
    });
</script>
<style>
    .collection {
        border-bottom: 1px solid gray;
        height: 100px;
        width: 100%;
        padding: 10px;
    }

    summary::-webkit-details-marker {
        color: blue;
    }

    summary:focus {
        outline-style: none;
    }
</style>

<main>
    {#if allCollections.length==0}
        <h3>No Collections</h3>
    {/if}

    <div class="scroll">
        {#each allCollections as collection,i}
            <div class="collection">
                {collection.title}
            </div>
        {/each}
        <div style="height: 200px;"></div>
    </div>
</main>