<script>
    import { getContext } from "svelte";

    export let collectionName;
    export let shareText;

    const { close } = getContext("simple-modal");

    var copyTextAndClose = () => {
        var copyText = document.getElementById("share-text-input");

        /* Select the text field */
        copyText.select();

        /* Copy the text inside the text field */
        document.execCommand("copy");

        close();
    };
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

    textarea {
        width: 100%;
        max-width: 100%;
        min-width: 100%;
        height: 12em;
        font-family: inherit;
        font-size: 0.9rem;
        outline: none;
        padding: 10px 14px;
        border-radius: 8px;
        border: 1px solid var(--outline-btn-border);
        background: var(--tile-bg);
        color: var(--txt);
        box-sizing: border-box;
        transition: all 0.2s ease;
        resize: vertical;
    }
    textarea:focus {
        border-color: var(--accent);
        background: var(--bg);
        box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .modal-bottom-bar {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
    }

    button {
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
    button:hover {
        background-color: var(--accent-hover);
        box-shadow: 0 4px 10px var(--accent-glow);
        transform: translateY(-1px);
    }
    button:active {
        transform: translateY(0);
    }
</style>

<main>
    <h1>Share Collection: {collectionName}</h1>

    <textarea id="share-text-input" bind:value={shareText} readonly></textarea>

    <div class="modal-bottom-bar">
        <button class="pointer" onclick={copyTextAndClose}>Copy Text</button>
    </div>
</main>
