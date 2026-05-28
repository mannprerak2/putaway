<script>
    import { getContext } from "svelte";
    const { close } = getContext("simple-modal");

    // FontAwesome icons.
    import Fa from "sveltejs-fontawesome";
    import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";

    export let quickLinks;

    function onClickSave() {
        close(quickLinks);
    }

    function handleKeyUp(event) {
        // on press enter
        if (event.keyCode == 13) {
            onClickSave();
        }
    }
    function deleteLink(index) {
        quickLinks.splice(index, 1);
        quickLinks = quickLinks;
    }
    function addQuickLink() {
        quickLinks.push({ icon: "", url: "" });
        quickLinks = quickLinks;
    }
</script>

<svelte:window on:keyup={handleKeyUp} />

<main>
    <h1>Edit Quick Links</h1>

    <div class="links-list">
        {#each quickLinks as ql, index}
            <div class="link-row">
                <img alt="" src={ql.icon || "favicon.png"} height="24px" width="24px" />
                
                <div class="input-group" style="flex: 2;">
                    <label for="url-{index}">URL</label>
                    <input id="url-{index}" bind:value={ql.url} type="text" placeholder="https://example.com" />
                </div>
                
                <div class="input-group" style="flex: 1.5;">
                    <label for="icon-{index}">Icon URL</label>
                    <input id="icon-{index}" bind:value={ql.icon} type="text" placeholder="https://example.com/favicon.png" />
                </div>
                
                <button class="delete-btn" onclick={(e) => deleteLink(index)} aria-label="Delete link">
                    <Fa icon={faTimesCircle} size="lg" />
                </button>
            </div>
        {/each}
    </div>

    <button id="add-quick-link" onclick={addQuickLink}>
        + Add New Link
    </button>
    
    <div class="modal-bottom-bar">
        <button class="save-btn pointer" onclick={onClickSave}>Save Links</button>
    </div>
</main>

<style>
    h1 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 20px;
        color: var(--txt);
        letter-spacing: -0.01em;
    }

    .links-list {
        max-height: 280px;
        overflow-y: auto;
        padding-right: 4px;
        margin-bottom: 16px;
    }

    .link-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        background: var(--tile-bg);
        border: 1px solid var(--outline-btn-border);
        border-radius: 10px;
        padding: 8px 12px;
        box-sizing: border-box;
    }

    .link-row img {
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.05);
        padding: 2px;
        flex-shrink: 0;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .input-group label {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--icon-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    input {
        width: 100%;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid var(--outline-btn-border);
        background: var(--bg);
        color: var(--txt);
        font-size: 0.9rem;
        font-family: inherit;
        outline: none;
        box-sizing: border-box;
        transition: all 0.2s ease;
    }
    input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        color: var(--icon-color);
        background: transparent;
        border: none;
        transition: all 0.2s ease;
        flex-shrink: 0;
        cursor: pointer;
    }
    .delete-btn:hover {
        background-color: var(--danger);
        color: white;
    }

    #add-quick-link {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        margin: 12px auto;
        width: fit-content;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--accent);
        border: 1px dashed var(--accent);
        border-radius: 20px;
        background: transparent;
        transition: all 0.2s ease;
        cursor: pointer;
    }
    #add-quick-link:hover {
        background-color: var(--outline-btn-hover);
        transform: translateY(-1px);
    }

    .modal-bottom-bar {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
    }

    .save-btn {
        background-color: var(--accent);
        border-radius: 8px;
        color: var(--accent-txt, white);
        padding: 8px 24px;
        font-size: 0.9rem;
        font-weight: 600;
        text-align: center;
        transition: all 0.2s ease;
        border: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .save-btn:hover {
        background-color: var(--accent-hover);
        box-shadow: 0 4px 10px var(--accent-glow);
        transform: translateY(-1px);
    }
    .save-btn:active {
        transform: translateY(0);
    }
</style>
