<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import CreateCollectionModal from './CreateCollectionModal.svelte';
    import { getContext } from 'svelte';

    const { open } = getContext('simple-modal');

    let allCollections = [];

    onMount(() => {
        chrome.storage.local.get('pid', function (res) {
            chrome.bookmarks.getChildren(res['pid'], function (children) {
                allCollections = children;
            });
        })
    });

    var createCollection = () => {
        open(CreateCollectionModal, {});
    }
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

    .plus-icon {
        position: absolute;
        margin-right: 20px;
        margin-bottom: 100px;
        bottom: 0;
        right: 0;
        width: 40px;
        height: 40px;
        border-width: 8px;
        border-radius: 100%;
        background: -webkit-linear-gradient(0deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%), -webkit-linear-gradient(90deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%);
        border-color: gray;
        background-color: gray;
    }

    .plus-icon:hover {
        cursor: pointer;
    }
</style>

<main style="position: relative;">
    {#if allCollections.length==0}
        <h3>No Collections</h3>
    {/if}

    <button class="plus-icon" on:click|preventDefault|stopPropagation={createCollection}></button>

    <div class="scroll">
        {#each allCollections as collection,i}
            <div class="collection">
                {collection.title}
            </div>
        {/each}
        <div style="height: 200px;"></div>
    </div>

</main>