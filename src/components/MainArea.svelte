<script>
    import { onMount, getContext } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import CreateCollectionModal from './CreateCollectionModal.svelte';
    import CollectionTile from './tiles/CollectionTile.svelte';
    const { open } = getContext('simple-modal');

    // array of BookmarkTreeNode
    let allCollections = [];

    onMount(() => {
        chrome.storage.local.get('pid', function (res) {
            chrome.bookmarks.getChildren(res.pid, function (children) {
                // only folders
                allCollections = children.filter((e) => e.url == null);
            });
        });
    });

    var clickAddCollection = async () => {
        var c = await open(CreateCollectionModal);
        if (c) {
            // add to list at its index
            allCollections.splice(c.index, 0, c);
            allCollections = allCollections;
        }
    }
</script>
<style>
    .plus-icon-dummy {
        width: 20px;
        height: 20px;
        border-width: 3px;
        border-radius: 100%;
        background: -webkit-linear-gradient(0deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%), -webkit-linear-gradient(90deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%);
        border-color: gray;
        background-color: gray;
    }

    .plus-icon {
        position: absolute;
        margin-right: 20px;
        margin-bottom: 8vh;
        bottom: 0;
        right: 0;
        width: 40px;
        height: 40px;
        border-width: 8px;
        border-radius: 100%;
        background: -webkit-linear-gradient(0deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%), -webkit-linear-gradient(90deg, transparent 0%, transparent 46%, white 46%, white 56%, transparent 56%, transparent 100%);
        border-color: gray;
        background-color: gray;
        z-index: 2;
    }

    .plus-icon:hover {
        cursor: pointer;
    }

    .no-collections-indicator {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        margin-bottom: 100px;
        left: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        align-content: center;
        justify-content: center;
    }
</style>

<main style="position: relative;">

    {#if allCollections.length==0 }
        <div class="no-collections-indicator">
            <h3 >No Collections, Click '</h3>
            <button class="plus-icon-dummy"></button>
            <h3>' To create one</h3>
        </div>
    {/if}

    <button class="plus-icon" on:click|preventDefault|stopPropagation={clickAddCollection}></button>

    <div class="scroll">
        {#each allCollections as collection,i (collection.id)}
            <CollectionTile {collection}/>
        {/each}
        <div style="height: 200px;"></div>
    </div>
</main>