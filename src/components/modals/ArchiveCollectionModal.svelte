<script>
    import { getContext } from "svelte";

    export let collection;
    export let toArchive;
    const { close } = getContext("simple-modal");
</script>

<main>
    <div style="padding: 10px; font-size: 2em;">
        Are you sure you want to
        {#if toArchive}
            Archive
        {:else}
            Unarchive
        {/if}
        {collection.title}
        ?
    </div>
    <div class="modal-bottom-bar">
        <button class="pointer" onclick={close}>Yes</button>
    </div>
</main>

<style>
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
