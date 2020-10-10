<script>
    import { getContext } from "svelte";

    let collectionName = "";
    let errorString = "";

    const { close } = getContext("simple-modal");

    function createBookmarkFolder() {
        chrome.storage.local.get("pid", function (map) {
            chrome.bookmarks.create(
                {
                    parentId: map.pid,
                    title: collectionName,
                    index: 0,
                },
                function (createdFolder) {
                    close(createdFolder);
                }
            );
        });
    }

    var onClickCreate = () => {
        collectionName = collectionName.trim();
        if (collectionName.length > 0) {
            errorString = "";
            createBookmarkFolder();
        } else {
            errorString = "Enter a collection Name";
        }
    };

    function handleKeyUp(event) {
        // on press enter
        if (event.keyCode == 13) {
            onClickCreate();
        }
    }

    function inputFormatter(str) {
        collectionName = str.replace(/\s+/g, " ");
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
    <h1>Collection Name -</h1>

    <!-- svelte-ignore a11y-autofocus -->
    <input bind:value={collectionName} type="text" onchange={inputFormatter(collectionName)} autofocus>

    <div class="modal-bottom-bar">
        <div style="padding: 10px; color: red;">{errorString}</div>
        <button class="pointer" on:click={onClickCreate}>Create Collection</button>
    </div>
</main>
