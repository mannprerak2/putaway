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
    textarea {
        width: 100%;
        max-width: 100%;
        min-width: 100%;
        height: 15em;
        font-family: Arial, Helvetica, sans-serif;
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

<main>
    <div style="padding: 10px; font-size: 2em;">
        Share Collection -
        {collectionName}
    </div>

    <textarea id="share-text-input" bind:value={shareText} type="text"/>

    <div class="modal-bottom-bar">
        <button class="pointer" on:click={copyTextAndClose}>Copy Text</button>
    </div>
</main>
