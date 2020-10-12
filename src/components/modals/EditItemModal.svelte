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

<main style="background-color: {itemColor}">
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
    <label><strong>Color</strong></label>
    &nbsp
    <select bind:value={itemColor} name="colors">
        <option value="">None</option>
        <option value="#ff000022">Red</option>
        <option value="#00ff0022">Green</option>
        <option value="#0000ff22">Blue</option>
        <option value="#ffff0022">Yellow</option>
        <option value="#ff00ff22">Purple</option>
        <option value="#00ffff22">Cyan</option>
      </select>
</main>
