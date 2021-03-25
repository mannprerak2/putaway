<script>
    export let index;
    export let onDrop;
    let indicator = false;
    var onDragEnter = (e) => {
        indicator = true;
    };
    var onDragLeave = (e) => {
        indicator = false;
    };

    var handleDrop = (e) => {
        e.preventDefault();
        indicator = false;
        onDrop(e, index);
    };
</script>

<style>
    .no-items-indicator {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        left: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        align-content: center;
        justify-content: center;
        color: rgba(10, 10, 10, 0.2);
        font-size: 1em;
    }
</style>

{#if indicator}
    <div
        class="no-items-indicator"
        on:dragover|preventDefault={onDragEnter}
        on:dragleave={onDragLeave}
        on:drop={handleDrop}
        style="border: 1px dashed gray;">
        <h1>Drop to Add</h1>
    </div>
{:else}
    <div
        class="no-items-indicator"
        on:dragover|preventDefault={onDragEnter}
        on:dragleave={onDragLeave}
        on:drop={handleDrop}>
        <h3 style="color: var(--txt);">Drag 'n' Drop tabs to add to 'em this collection</h3>
    </div>
{/if}
