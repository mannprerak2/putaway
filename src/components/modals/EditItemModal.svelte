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
    h1 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 20px;
        color: var(--txt);
        letter-spacing: -0.01em;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 16px;
    }

    .form-group label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--icon-color);
    }

    input, select {
        width: 100%;
        padding: 10px 14px;
        border-radius: 8px;
        border: 1px solid var(--outline-btn-border);
        background: var(--tile-bg);
        color: var(--txt);
        font-size: 0.95rem;
        font-family: inherit;
        outline: none;
        box-sizing: border-box;
        transition: all 0.2s ease;
    }
    input:focus, select:focus {
        border-color: var(--accent);
        background: var(--bg);
        box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .modal-bottom-bar {
        margin-top: 24px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
    }

    button {
        background-color: var(--accent);
        border-radius: 8px;
        color: var(--accent-txt, white);
        padding: 8px 18px;
        font-size: 0.9rem;
        font-weight: 600;
        text-align: center;
        transition: all 0.2s ease;
        border: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    button:hover {
        background-color: var(--accent-hover);
        box-shadow: 0 4px 10px var(--accent-glow);
        transform: translateY(-1px);
    }
    button:active {
        transform: translateY(0);
    }
</style>

<svelte:window on:keyup={handleKeyUp} />

<main style="transition: background 0.3s ease; padding: 4px; border-radius: 8px; background-color: {itemColor || 'transparent'}">
    <h1>Edit Item</h1>

    <div class="form-group">
        <label for="item-name">Name</label>
        <input
            id="item-name"
            bind:value={itemName}
            type="text"
            onchange={inputFormatter(itemName)} />
    </div>

    <div class="form-group">
        <label for="item-icon">Icon URL</label>
        <input
            id="item-icon"
            bind:value={itemFavIconLink}
            type="text" />
    </div>

    <div class="form-group">
        <label for="item-color">Card Color Accent</label>
        <select id="item-color" bind:value={itemColor} name="colors">
            <option value="">None</option>
            <option value="#ff000022">Red</option>
            <option value="#00ff0022">Green</option>
            <option value="#0000ff22">Blue</option>
            <option value="#ffff0022">Yellow</option>
            <option value="#ff00ff22">Purple</option>
            <option value="#00ffff22">Cyan</option>
        </select>
    </div>

    <div class="modal-bottom-bar">
        {#if errorString}
            <div style="font-size: 0.85rem; color: var(--danger); font-weight: 500;">{errorString}</div>
        {/if}
        <button class="pointer" onclick={onClickCreate}>Update</button>
    </div>
</main>
