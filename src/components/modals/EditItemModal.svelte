<script>
    import { getContext } from "svelte";

    export let item;

    let errorString = "";

    let title = item.title.split(":::::");

    let itemName = title[0];
    let itemFavIconLink = title.length > 1 ? title[1] : "";
    let itemColor = title.length > 2 ? title[2] : "";

    const { close } = getContext("simple-modal");

    function updateCollection() {
        let newTitle =
            itemName + ":::::" + itemFavIconLink + ":::::" + itemColor;
        chrome.bookmarks.update(
            item.id,
            {
                title: newTitle,
            },
            function (i) {
                close(newTitle);
            }
        );
    }

    var onClickCreate = () => {
        itemName = itemName.trim();
        if (itemName.length > 0) {
            errorString = "";
            updateCollection();
        } else {
            errorString = "Item name cannot be empty";
        }
    };

    function handleKeyUp(event) {
        // on press enter
        if (event.keyCode == 13) {
            onClickCreate();
        }
    }

    function inputFormatter(str) {
        itemName = str.replace(/\s+/g, " ");
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
    <h1>Edit Item -</h1>

    <label><strong>Name</strong></label>
    <input
        bind:value={itemName}
        type="text"
        onchange={inputFormatter(itemName)} />
    <br><br>
    <label><strong>Icon Url</strong></label>
    <input
        bind:value={itemFavIconLink}
        type="text"/>
    <br><br>
    <div class="modal-bottom-bar">
        <div style="padding: 10px; color: red;">{errorString}</div>
        <button class="pointer" on:click={onClickCreate}>Update</button>
    </div>
</main>
