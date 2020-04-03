<script>
    import { getContext } from 'svelte';

    export let collectionName;

    const { close } = getContext('simple-modal');

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

<main>
    <div style="padding: 10px; font-size: 2em;">Are you sure you want to delete {collectionName} ?</div>
    <div class="modal-bottom-bar">
        <button class="pointer" on:click={close}>Delete</button>
    </div>
</main>