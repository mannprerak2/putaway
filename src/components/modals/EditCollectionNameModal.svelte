<script>
    import { getContext } from 'svelte';

    export let collection;

    let collectionName = collection.title;
    let errorString = '';


    const { close } = getContext('simple-modal');

    function renameCollection() {
        chrome.bookmarks.update(collection.id, { title: collectionName }, function (i) {
            close(i.title);
        });
    }

    var onClickCreate = () => {
        collectionName = collectionName.trim();
        if (collectionName.length > 0) {
            errorString = '';
            renameCollection();
        } else {
            errorString = 'Collection name cannot be empty';
        }
    }

    function handleKeyUp(event) {
        // on press enter
        if (event.keyCode == 13) {
            onClickCreate();
        }
    }

    function inputFormatter(str) {
        collectionName = str.replace(/\s+/g, ' ');
    }
</script>
<style>
    input {
        width: 100%;
        outline: none;
        padding: 10px;
        box-sizing: border-box;
    }

    .modal-bottom-bar {
        margin-top: 20px;
        display: flex;
        flex-direction: row;
        float: right;
        align-items: center;
    }

    button {
        background-color: gray;
        border-radius: 10px;
        color: white;
        padding: 8px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
    }
</style>

<svelte:window on:keyup={handleKeyUp} />

<main>
    <h1>Edit Collection Name -</h1>

    <!-- svelte-ignore a11y-autofocus -->
    <input bind:value={collectionName} type="text" onchange={inputFormatter(collectionName)} autofocus>

    <div class="modal-bottom-bar">
        <div style="padding: 10px; color: red;">{errorString}</div>
        <button class="pointer" on:click={onClickCreate}>Save</button>
    </div>
</main>