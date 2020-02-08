<script>
    let collectionName = '';
    let errorString = '';
    var onClickCreate = () => {
        if (collectionName.length > 0) {
            errorString = '';
        } else {
            errorString = 'Enter a collection Name';
        }
    }

    function handleKeydown(event) {
        // on press enter
        if (event.keyCode == 13) {
            onClickCreate();
        }
    }

    function keepTrimed() {
        collectionName = collectionName.trim();
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

    button:hover {
        cursor: pointer;
    }
</style>

<svelte:window on:keydown={handleKeydown} />

<main>
    <h1>Collection Name -</h1>

    <!-- svelte-ignore a11y-autofocus -->
    <input bind:value={collectionName} type="text" onchange={keepTrimed} autofocus>

    <div class="modal-bottom-bar">
        <div style="padding: 10px; color: red;">{errorString}</div>
        <button on:click={onClickCreate}>Create Collection</button>
    </div>
</main>