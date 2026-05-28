<script>
    import { getContext } from "svelte";

    var dt = new Date();
    let collectionName = `Session ${dt.getDate()}-${(
        dt.getMonth() + 1
    ).toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
    })}-${dt.getFullYear()}, ${dt.getHours()}:${dt
        .getMinutes()
        .toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
        })}:${dt
        .getSeconds()
        .toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
        })}`;
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
    h1 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 16px;
        color: var(--txt);
        letter-spacing: -0.01em;
    }

    input {
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
    input:focus {
        border-color: var(--accent);
        background: var(--bg);
        box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .modal-bottom-bar {
        margin-top: 20px;
        display: flex;
        flex-direction: row;
        float: right;
        align-items: center;
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

<main>
    <h1>Collection Name</h1>

    <!-- svelte-ignore a11y-autofocus -->
    <input bind:value={collectionName} type="text" onchange={inputFormatter(collectionName)} autofocus>

    <div class="modal-bottom-bar">
        {#if errorString}
            <div style="font-size: 0.85rem; color: var(--danger); font-weight: 500;">{errorString}</div>
        {/if}
        <button class="pointer" onclick={onClickCreate}>Save Session to Collection</button>
    </div>
</main>
